import { reportOwnVote } from "@components/ClaimVote/reportOwnVote";
import { useModal } from "@getpara/react-sdk-lite";
import { useContestStore } from "@hooks/useContest/store";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { xClaimKeys } from "@hooks/useXClaim/queries";
import { useWalletProof } from "@hooks/useXClaim/useWalletProof";
import { useQueryClient } from "@tanstack/react-query";
import { hasReceipt, readOwnFundsCover, readUserVotes, waitForReceiptStatus } from "lib/claimVote/chain";
import { PAYOUT_WINDOW_MS, RECEIPT_CONFIRMATIONS, VOTING_WATCHDOG_MS } from "lib/claimVote/constants";
import {
  intentFor,
  intentPath,
  isClaimForIntent,
  matchIntent,
  normalizedAmount,
  sameEntrySentHash,
} from "lib/claimVote/intent";
import { takeLanding } from "lib/claimVote/landing";
import { voteIntentStore } from "lib/claimVote/storage";
import { isRetryableEnding, planStart } from "lib/claimVote/transition";
import type {
  ClaimVoteCasterMount,
  ClaimVoteFacts,
  ClaimVoteRun,
  ContestTarget,
  StartDecision,
  StartPlan,
  VoteChoice,
  VoteIntent,
  VoteOutcome,
} from "lib/claimVote/types";
import { startXLogin, submitClaim, toXClaimFailure } from "lib/xClaim/client";
import { LANDING_WALLET_WAIT_MS } from "lib/xClaim/constants";
import { confirmOutcome, isDecimalAmount, safeReturnPath } from "lib/xClaim/outcomes";
import type { XClaimEmbeddedWallet } from "lib/xClaim/types";
import { walletAddressOf } from "lib/xClaim/wallet";
import { useCallback, useEffect, useMemo } from "react";
import { parseEther } from "viem";
import { useShallow } from "zustand/shallow";
import { useClaimVoteStore } from "./store";
import { useClaimVoteFacts } from "./useClaimVoteFacts";

const VOTE_NOT_STARTED = "we couldn't start your vote. try again.";

const WALLET_BOUND_PHASES: readonly ClaimVoteRun["phase"][] = ["verify_x", "claiming", "funding"];

const creditWeiOf = (tokenAmount: string | null) =>
  tokenAmount && isDecimalAmount(tokenAmount) ? parseEther(tokenAmount) : null;

const planWithIntent = async ({
  decision,
  choice,
  facts,
  contest,
}: {
  decision: StartDecision;
  choice: VoteChoice;
  facts: ClaimVoteFacts;
  contest: ContestTarget;
}): Promise<StartPlan> => {
  const { wallet } = facts;
  if (decision.kind === "sign_in") return decision;
  if (wallet.kind !== "embedded") {
    return {
      kind: "refuse",
      ending: decision.kind === "refuse" ? decision.ending : { kind: "unavailable" },
      intent: null,
    };
  }
  const earlierHash = sameEntrySentHash(facts.intent, {
    wallet,
    contest: facts.contest,
    proposalId: choice.proposalId,
    now: Date.now(),
  });
  const hasEarlierLanded = earlierHash
    ? await hasReceipt({ hash: earlierHash, chainId: contest.chainId }).catch(() => false)
    : false;
  const sentTxHash = hasEarlierLanded ? null : earlierHash;
  const intentWith = (votesBefore: bigint | null, ownFundsCover: boolean): VoteIntent =>
    intentFor({
      choice,
      wallet: wallet.address,
      contest: facts.contest,
      votesBefore,
      ownFundsCover,
      sentTxHash,
      now: Date.now(),
    });
  if (decision.kind === "refuse" && !isRetryableEnding(decision.ending)) return { ...decision, intent: null };
  const [votesBefore, ownFundsCover] = await Promise.all([
    decision.kind === "refuse"
      ? null
      : readUserVotes({ contest, proposalId: choice.proposalId, wallet: wallet.address }).catch(() => null),
    readOwnFundsCover({
      contest,
      wallet: wallet.address,
      amountNative: normalizedAmount(choice.amountNative),
    }).catch(() => false),
  ]);
  const intent = intentWith(votesBefore, ownFundsCover);
  return decision.kind === "refuse" ? { ...decision, intent } : { kind: decision.kind, intent };
};

export const useClaimVoteDriver = () => {
  const { run, step, modalOpen, skippedWallets, dispatch, begin, isCurrent } = useClaimVoteStore(
    useShallow(state => ({
      run: state.run,
      step: state.step,
      modalOpen: state.modalOpen,
      skippedWallets: state.skippedWallets,
      dispatch: state.dispatch,
      begin: state.begin,
      isCurrent: state.isCurrent,
    })),
  );
  const facts = useClaimVoteFacts({ enabled: true, pollUntil: run.phase === "funding" ? run.until : null });
  const { address, abi, chainId, version } = useContestConfigStore(
    useShallow(state => ({
      address: state.contestConfig.address,
      abi: state.contestConfig.abi,
      chainId: state.contestConfig.chainId,
      version: state.contestConfig.version,
    })),
  );
  const isContestLoaded = useContestStore(state => state.isSuccess);
  const { withParaProof } = useWalletProof();
  const { isOpen: isParaModalOpen } = useModal();
  const queryClient = useQueryClient();
  const contest = useMemo((): ContestTarget => ({ address, abi, chainId, version }), [address, abi, chainId, version]);

  const { wallet, intent, me, meUpdatedAt, meFailedAt, meSettled, spots, spotsFailed } = facts;
  const finishVote = useCallback(
    (outcome: VoteOutcome) => {
      if (run.phase === "voting" && run.payout === null) reportOwnVote(outcome);
      dispatch({ type: "vote_done", outcome });
    },
    [run, dispatch],
  );
  const isPlanReady = wallet.kind !== "embedded" || (meSettled && (spots !== null || spotsFailed));

  useEffect(() => {
    const landing = takeLanding("run", Date.now());
    if (landing) dispatch({ type: "landed", hint: landing.result, at: landing.at });
  }, [dispatch]);

  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) dispatch({ type: "abort" });
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [dispatch]);

  useEffect(() => {
    if (run.phase !== "starting" || !isPlanReady || !begin(step)) return;
    const address = walletAddressOf(facts.wallet);
    if (address && skippedWallets.includes(address.toLowerCase())) {
      dispatch({ type: "abort" });
      return;
    }
    const decision = planStart(facts, run.origin);
    void planWithIntent({ decision, choice: run.choice, facts, contest }).then(plan => {
      if (isCurrent(step)) dispatch({ type: "planned", plan });
    });
  }, [run, step, isPlanReady, facts, contest, skippedWallets, begin, isCurrent, dispatch]);

  useEffect(() => {
    if (run.phase === "pitch" && wallet.kind !== "signed_out" && !isParaModalOpen) dispatch({ type: "signed_in" });
  }, [run.phase, wallet.kind, isParaModalOpen, dispatch]);

  useEffect(() => {
    if (!WALLET_BOUND_PHASES.includes(run.phase) || wallet.kind !== "embedded" || !intent) return;
    if (wallet.address.toLowerCase() !== intent.wallet) dispatch({ type: "abort" });
  }, [run.phase, wallet, intent, dispatch]);

  useEffect(() => {
    if (run.phase !== "claiming") return;
    if (wallet.kind !== "embedded") {
      dispatch({ type: "abort" });
      return;
    }
    if (!begin(step)) return;
    const matched = matchIntent(intent, { wallet, contest: facts.contest, now: Date.now() });
    if (!matched) {
      dispatch({ type: "abort" });
      return;
    }
    const signedIn: XClaimEmbeddedWallet = wallet;
    if (run.via === "worker") {
      void withParaProof({ wallet: signedIn, call: submitClaim })
        .then(result => {
          if (isCurrent(step)) dispatch({ type: "claim_settled", result });
        })
        .catch(error => {
          if (isCurrent(step)) dispatch({ type: "claim_failed", failure: toXClaimFailure(error) });
        })
        .finally(() => {
          queryClient.invalidateQueries({ queryKey: xClaimKeys.spots });
          queryClient.invalidateQueries({ queryKey: xClaimKeys.me(signedIn.address) });
        });
      return;
    }
    const returnPath = safeReturnPath({ preferred: intentPath(matched), fallback: "/" });
    void withParaProof({ wallet: signedIn, call: proof => startXLogin({ proof, returnPath }) })
      .then(({ authorizeUrl }) => {
        if (isCurrent(step)) window.location.assign(authorizeUrl);
      })
      .catch(error => {
        if (isCurrent(step)) dispatch({ type: "claim_failed", failure: toXClaimFailure(error) });
      });
  }, [run, step, wallet, intent, facts.contest, withParaProof, queryClient, begin, isCurrent, dispatch]);

  useEffect(() => {
    if (run.phase !== "confirming") return;
    if (wallet.kind === "signed_out") {
      const waitMs = Math.max(run.landedAt + LANDING_WALLET_WAIT_MS - Date.now(), 0);
      const timer = setTimeout(() => dispatch({ type: "wallet_unavailable" }), waitMs);
      return () => clearTimeout(timer);
    }
    const matched = matchIntent(intent, { wallet, contest: facts.contest, now: Date.now() });
    if (!matched || wallet.kind !== "embedded") {
      dispatch({ type: "wallet_unavailable" });
      return;
    }
    if (me && meUpdatedAt > run.landedAt) {
      const truth = confirmOutcome(run.hint, me);
      const isStaleClaim = !!me.claim && !isClaimForIntent(me.claim, matched);
      if (truth && isStaleClaim && (truth.kind === "paid" || truth.kind === "pending")) {
        dispatch({ type: "claim_settled", result: { kind: "wallet_claimed" } });
        return;
      }
      dispatch(
        truth
          ? { type: "claim_settled", result: truth }
          : { type: "claim_failed", failure: { reason: "temporary", detail: "unconfirmed" } },
      );
      return;
    }
    if (meFailedAt > run.landedAt) {
      dispatch({ type: "claim_failed", failure: { reason: "temporary", detail: "claim_me_failed" } });
      return;
    }
    if (begin(step)) void queryClient.refetchQueries({ queryKey: xClaimKeys.me(wallet.address) });
  }, [run, step, wallet, intent, facts.contest, me, meUpdatedAt, meFailedAt, queryClient, begin, dispatch]);

  useEffect(() => {
    if (run.phase !== "funding") return;
    const timer = setTimeout(() => dispatch({ type: "payout_slow" }), Math.max(run.until - Date.now(), 0));
    return () => clearTimeout(timer);
  }, [run, dispatch]);

  useEffect(() => {
    if (run.phase !== "funding" || !me?.claim || meUpdatedAt <= run.until - PAYOUT_WINDOW_MS) return;
    const { claim } = me;
    if (claim.status === "failed") {
      dispatch({ type: "payout_reverted" });
      return;
    }
    const isActive = claim.status === "paid" || claim.status === "pending";
    if (isActive && claim.payout.txHash && claim.payout.txHash !== run.payout.txHash) {
      dispatch({ type: "payout_updated", payout: claim.payout });
    }
  }, [run, me, meUpdatedAt, dispatch]);

  useEffect(() => {
    if (run.phase !== "funding" || !run.payout.txHash || !begin(step)) return;
    const { txHash, tokenAmount } = run.payout;
    void waitForReceiptStatus({
      hash: txHash,
      chainId,
      timeoutMs: run.until - Date.now(),
      confirmations: RECEIPT_CONFIRMATIONS,
    })
      .then(receipt => {
        if (!isCurrent(step)) return;
        if (receipt.status === "reverted") {
          dispatch({ type: "payout_reverted" });
          return;
        }
        void queryClient.invalidateQueries({ queryKey: ["balance"] });
        dispatch({
          type: "payout_landed",
          payout: { txHash, receiptBlock: receipt.blockNumber, creditWei: creditWeiOf(tokenAmount) },
        });
      })
      .catch(() => {
        if (isCurrent(step)) dispatch({ type: "payout_slow" });
      });
  }, [run, step, chainId, queryClient, begin, isCurrent, dispatch]);

  useEffect(() => {
    if (run.phase !== "voting") return;
    const timer = setTimeout(() => {
      if (voteIntentStore.read()?.castingAt) return;
      finishVote({ kind: "failed", failure: { kind: "error", message: VOTE_NOT_STARTED } });
    }, VOTING_WATCHDOG_MS);
    return () => clearTimeout(timer);
  }, [run, finishVote]);

  useEffect(() => {
    if (run.phase === "voting" && !intent) finishVote({ kind: "failed", failure: { kind: "no_intent" } });
  }, [run.phase, intent, finishVote]);

  const caster = useMemo(
    (): ClaimVoteCasterMount | null =>
      run.phase === "voting" && intent && isContestLoaded ? { intent, payout: run.payout, step } : null,
    [run, intent, isContestLoaded, step],
  );

  return { run, modalOpen, facts, caster, contest, dispatch, finishVote };
};
