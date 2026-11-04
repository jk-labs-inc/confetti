import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import type { CastVotesOptions, CastVotesResult } from "@hooks/useCastVotes/types";
import { getAccount, switchChain } from "@wagmi/core";
import type { XClaimWallet } from "lib/xClaim/types";
import { didUserReject, handleError as describeError } from "utils/error";
import { formatEther, type Hash, WaitForTransactionReceiptTimeoutError } from "viem";
import { SENDING_GUARD_MS, SENT_VOTE_RECEIPT_TIMEOUT_MS, SENT_VOTE_RECHECK_MS } from "./constants";
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

const SENT_VOTE_DROPPED = "the network didn't take your vote. try again.";

const EARLIER_VOTE_CONFIRMING = "your last vote is still confirming. try again in a minute.";

const OWN_FUNDS: Pick<FundedPayout, "receiptBlock" | "creditWei"> = { receiptBlock: 0n, creditWei: 0n };

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

const settleSentVote = async ({
  intent,
  hash,
  chainId,
  isMounted,
}: {
  intent: VoteIntent;
  hash: Hash;
  chainId: number;
  isMounted: () => boolean;
}): Promise<VoteOutcome> => {
  while (isMounted()) {
    try {
      const settled = await settleEarlierVote({ ...intent, sentTxHash: hash }, chainId);
      if (settled === "voted") return { kind: "already_voted" };
      voteIntentStore.update({ sendingAt: null, castingAt: null });
      return failed({ kind: "error", message: SENT_VOTE_DROPPED });
    } catch {
      await sleep(SENT_VOTE_RECHECK_MS);
    }
  }
  return failed({ kind: "error", message: LEFT_THE_PAGE });
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
  isSilent,
  contest,
  votesCloseMs,
  priceIntervalSec,
  isMounted,
  cast,
}: {
  intent: VoteIntent | null;
  wallet: XClaimWallet;
  payout: FundedPayout | null;
  isSilent: boolean;
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
  const funding = payout ?? OWN_FUNDS;
  const { target } = contest;
  let sentHash = null as Hash | null;
  let isCasting = false;

  try {
    const config = getWagmiConfig();
    if (getAccount(config).chainId !== target.chainId) await switchChain(config, { chainId: target.chainId });

    const alreadyVoted =
      (await settleEarlierVote(intent, target.chainId)) === "voted" || (await votesRoseSince(intent, target));
    if (alreadyVoted) return { kind: "already_voted" };

    const typedWei = chosenWei(intent.amountNative);
    if (funding.creditWei === null && typedWei === 0n) return failed({ kind: "credit_unknown" });
    const spendable = await readSpendableAfter({
      wallet: intent.wallet,
      chainId: target.chainId,
      minBlock: funding.receiptBlock,
    });
    await sleep(msUntilPriceSettles({ now: Date.now(), votesCloseMs, intervalSec: priceIntervalSec }));
    const priceWei = await readPricePerVote(target);
    const size = sizeClaimVote({
      spendableWei: spendable,
      chosenWei: typedWei,
      creditWei: funding.creditWei ?? 0n,
      priceWei,
    });
    if ("reason" in size) return failed({ kind: "cannot_afford" });
    if (!isMounted()) return failed({ kind: "error", message: LEFT_THE_PAGE });
    if (!isWalletConnected(intent.wallet)) return failed({ kind: "no_intent" });
    voteIntentStore.update({ castingAt: Date.now() });
    isCasting = true;

    const result = await cast(size.votes, {
      pricePerVoteRaw: priceWei,
      feedback: isSilent ? "silent" : "standard",
      onSent: hash => {
        sentHash = hash;
        voteIntentStore.update({ sentTxHash: hash });
      },
    });
    return {
      kind: "voted",
      result,
      spentNative: formatEther(size.valueWei),
      wantedNative: size.wantedMore ? intent.amountNative : null,
    };
  } catch (error) {
    if (sentHash) {
      const settled = await settleSentVote({ intent, hash: sentHash, chainId: target.chainId, isMounted });
      return settled.kind === "failed" && !isSilent ? { ...settled, isShown: true } : settled;
    }
    const failure = failureFor(error, contest.key.chain);
    return isCasting && !isSilent ? { kind: "failed", failure, isShown: true } : failed(failure);
  } finally {
    if (!sentHash) voteIntentStore.update({ sendingAt: null, castingAt: null });
  }
};
