import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import type { CastVotesOptions, CastVotesResult } from "@hooks/useCastVotes/types";
import { getAccount, switchChain } from "@wagmi/core";
import type { XClaimWallet } from "lib/xClaim/types";
import { didUserReject, handleError as describeError } from "utils/error";
import { WaitForTransactionReceiptTimeoutError } from "viem";
import { SENDING_GUARD_MS, SENT_VOTE_RECEIPT_TIMEOUT_MS } from "./constants";
import {
  isTransactionKnown,
  readPricePerVote,
  readSpendableAfter,
  readUserVotes,
  sleep,
  waitForReceiptStatus,
} from "./chain";
import { matchIntent } from "./intent";
import { chosenWei, msUntilPriceSettles, sizeClaimVote } from "./sizing";
import { voteIntentStore } from "./storage";
import type { ContestKey, ContestTarget, FundedPayout, VoteFailure, VoteIntent, VoteOutcome } from "./types";

const LEFT_THE_PAGE = "you left the contest page before your vote was sent.";

const EARLIER_VOTE_CONFIRMING = "your last vote is still confirming. try again in a minute.";

const failed = (failure: VoteFailure): VoteOutcome => ({ kind: "failed", failure });

const failureFor = (error: unknown, chainName: string): VoteFailure => {
  if (didUserReject(error)) return { kind: "rejected" };
  if (error instanceof WaitForTransactionReceiptTimeoutError)
    return { kind: "error", message: EARLIER_VOTE_CONFIRMING };
  return { kind: "error", message: describeError(error, chainName).message };
};

const settleEarlierVote = async (intent: VoteIntent, chainId: number): Promise<"voted" | "not_voted"> => {
  const hash = intent.sentTxHash;
  if (!hash) return "not_voted";
  try {
    const earlier = await waitForReceiptStatus({
      hash,
      chainId,
      timeoutMs: SENT_VOTE_RECEIPT_TIMEOUT_MS,
      confirmations: 1,
    });
    if (earlier.status === "success") return "voted";
  } catch (error) {
    if (!(error instanceof WaitForTransactionReceiptTimeoutError) || (await isTransactionKnown({ hash, chainId }))) {
      throw error;
    }
  }
  voteIntentStore.update({ sentTxHash: null });
  return "not_voted";
};

const isSendingElsewhere = (intent: VoteIntent, now: number) =>
  intent.sendingAt !== null && intent.sentTxHash === null && now - intent.sendingAt < SENDING_GUARD_MS;

const isWalletConnected = (wallet: VoteIntent["wallet"]) =>
  getAccount(getWagmiConfig()).address?.toLowerCase() === wallet;

const votesRoseSince = async (intent: VoteIntent, contest: ContestTarget): Promise<boolean> => {
  const votesNow = await readUserVotes({ contest, proposalId: intent.proposalId, wallet: intent.wallet });
  if (intent.votesBefore === null) {
    voteIntentStore.update({ votesBefore: votesNow.toString() });
    return false;
  }
  return votesNow > BigInt(intent.votesBefore);
};

export const castClaimVote = async ({
  intent: stored,
  wallet,
  payout,
  contest,
  votesCloseMs,
  priceIntervalSec,
  isMounted,
  cast,
}: {
  intent: VoteIntent | null;
  wallet: XClaimWallet;
  payout: FundedPayout;
  contest: { key: ContestKey; target: ContestTarget };
  votesCloseMs: number;
  priceIntervalSec: number | undefined;
  isMounted: () => boolean;
  cast: (votes: number, options: CastVotesOptions) => Promise<CastVotesResult>;
}): Promise<VoteOutcome> => {
  const intent = matchIntent(stored, { wallet, contest: contest.key, now: Date.now() });
  if (!intent) return failed({ kind: "no_intent" });
  if (Date.now() >= votesCloseMs) return failed({ kind: "voting_closed" });
  if (isSendingElsewhere(intent, Date.now())) return failed({ kind: "in_flight" });
  voteIntentStore.update({ sendingAt: Date.now() });
  const { entryTitle } = intent;
  const { target } = contest;
  let isSent = false;

  try {
    const config = getWagmiConfig();
    if (getAccount(config).chainId !== target.chainId) await switchChain(config, { chainId: target.chainId });

    const alreadyVoted =
      (await settleEarlierVote(intent, target.chainId)) === "voted" || (await votesRoseSince(intent, target));
    if (alreadyVoted) return { kind: "already_voted", entryTitle };

    const typedWei = chosenWei(intent.amountNative);
    if (payout.creditWei === null && typedWei === 0n) return failed({ kind: "credit_unknown" });
    const spendable = await readSpendableAfter({
      wallet: intent.wallet,
      chainId: target.chainId,
      minBlock: payout.receiptBlock,
    });
    await sleep(msUntilPriceSettles({ now: Date.now(), votesCloseMs, intervalSec: priceIntervalSec }));
    const priceWei = await readPricePerVote(target);
    const size = sizeClaimVote({
      spendableWei: spendable,
      chosenWei: typedWei,
      creditWei: payout.creditWei ?? 0n,
      priceWei,
    });
    if (size.votes === 0) return failed({ kind: "cannot_afford" });
    if (!isMounted()) return failed({ kind: "error", message: LEFT_THE_PAGE });
    if (!isWalletConnected(intent.wallet)) return failed({ kind: "no_intent" });

    const result = await cast(size.votes, {
      pricePerVoteRaw: priceWei,
      feedback: "silent",
      onSent: hash => {
        isSent = true;
        voteIntentStore.update({ sentTxHash: hash });
      },
    });
    return { kind: "voted", result, entryTitle };
  } catch (error) {
    return failed(failureFor(error, contest.key.chain));
  } finally {
    if (!isSent) voteIntentStore.update({ sendingAt: null });
  }
};
