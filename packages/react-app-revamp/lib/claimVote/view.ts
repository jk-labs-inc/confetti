import { boardForResult } from "lib/xClaim/view";
import type { XClaimBoardView, XClaimFailure, XClaimInput, XClaimPayout, XClaimSheetView } from "lib/xClaim/types";
import { isClaimForIntent, matchIntent } from "./intent";
import { canStartOwnVote, isRunBusy } from "./transition";
import type { ClaimVoteFacts, ClaimVoteLine, ClaimVoteModalView, ClaimVoteRun, CreditGate, VoteIntent } from "./types";

export const claimInputOf = (facts: ClaimVoteFacts): XClaimInput => ({
  configured: true,
  contestChain: facts.contest.chain,
  wallet: facts.wallet,
  spots: facts.spots,
  spotsFailed: facts.spotsFailed,
  me: facts.me,
  meUpdatedAt: facts.meUpdatedAt,
  meFailedAt: facts.meFailedAt,
  meLoading: !facts.meSettled,
  result: null,
  action: { name: null, stage: "idle", error: null },
});

export const finishablePayout = (facts: ClaimVoteFacts, now: number): XClaimPayout | null => {
  const intent = matchIntent(facts.intent, { wallet: facts.wallet, contest: facts.contest, now });
  const claim = facts.me?.claim;
  if (!intent || !claim || (claim.status !== "paid" && claim.status !== "pending")) return null;
  if (!isClaimForIntent(claim, intent)) return null;
  return claim.payout.txHash ? claim.payout : null;
};

export const ownVoteIntent = ({
  run,
  facts,
  now,
}: {
  run: ClaimVoteRun;
  facts: ClaimVoteFacts;
  now: number;
}): VoteIntent | null => {
  if (!canStartOwnVote(run)) return null;
  const intent = matchIntent(facts.intent, { wallet: facts.wallet, contest: facts.contest, now });
  return intent?.ownFundsCover ? intent : null;
};

export const claimVoteLine = ({
  run,
  facts,
  gate,
}: {
  run: ClaimVoteRun;
  facts: ClaimVoteFacts;
  gate: CreditGate;
}): ClaimVoteLine => {
  if (isRunBusy(run)) return { kind: "busy" };
  const { offer } = facts;
  if (offer.status !== "open" || facts.wallet.kind === "external") return { kind: "hidden" };
  if (facts.me?.link && !facts.me.link.eligible) return { kind: "hidden" };
  return gate === "covers" ? { kind: "offer", offer } : { kind: "hidden" };
};

const sheetView = (
  facts: ClaimVoteFacts,
  board: XClaimBoardView,
  error: XClaimFailure | null = null,
): XClaimSheetView => ({
  wallet: facts.wallet,
  spots: facts.spots,
  action: { stage: "idle", error },
  settling: false,
  ...board,
});

const claimBoard = (facts: ClaimVoteFacts, board: XClaimBoardView, error: XClaimFailure | null = null) =>
  ({ kind: "claim_board", view: sheetView(facts, board, error) }) satisfies ClaimVoteModalView;

const verifyBoard = (facts: ClaimVoteFacts): XClaimBoardView =>
  facts.wallet.kind === "embedded" && facts.wallet.signedInWithX ? { board: "ClaimConfirmX" } : { board: "ClaimStart" };

export const claimVoteModalView = ({
  run,
  facts,
}: {
  run: ClaimVoteRun;
  facts: ClaimVoteFacts;
}): ClaimVoteModalView | null => {
  const entryTitle = facts.intent?.entryTitle ?? "";
  switch (run.phase) {
    case "idle":
      return null;
    case "starting":
    case "claiming":
    case "confirming":
    case "funding":
    case "voting":
      return { kind: "running" };
    case "pitch":
      return claimBoard(facts, { board: "ClaimSignedOut" });
    case "verify_x":
      return claimBoard(facts, verifyBoard(facts));
    case "voted":
      return { kind: "voted", entryTitle: run.entryTitle, result: run.result, wantedMore: run.wantedMore };
    case "vote_failed":
      return { kind: "finish", entryTitle, failure: run.failure };
    case "payout_slow":
      return { kind: "payout_slow", entryTitle };
    case "claim_failed":
      if (run.retry.via === "landing") return { kind: "check_failed" };
      return claimBoard(
        facts,
        run.retry.via === "worker"
          ? { board: "ClaimLinked", handle: facts.me?.link?.handle ?? null }
          : verifyBoard(facts),
        run.failure,
      );
    case "ended":
      switch (run.ending.kind) {
        case "claim_outcome":
        case "landing_only":
          return claimBoard(facts, boardForResult(run.ending.result, claimInputOf(facts)));
        case "external_wallet":
          return { kind: "external_info" };
        case "unavailable":
          return { kind: "check_failed" };
        default: {
          const exhaustive: never = run.ending;
          return exhaustive;
        }
      }
    default: {
      const exhaustive: never = run;
      return exhaustive;
    }
  }
};
