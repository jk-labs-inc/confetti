import { isSettledResult, resultFromMe } from "lib/xClaim/outcomes";
import type { XClaimResult } from "lib/xClaim/types";
import { PAYOUT_WINDOW_MS } from "./constants";
import type {
  ClaimPath,
  ClaimVoteEvent,
  ClaimVoteFacts,
  ClaimVotePhase,
  ClaimVoteRun,
  IntentCommand,
  ModalCommand,
  RunEnding,
  StartDecision,
  StartOrigin,
  StartPlan,
  Transition,
  VoteIntent,
  VoteOutcome,
} from "./types";

export const IDLE_RUN: ClaimVoteRun = { phase: "idle" };

const KEEP: IntentCommand = { kind: "keep" };
const TOUCH: IntentCommand = { kind: "touch" };
const CLEAR: IntentCommand = { kind: "clear" };

const BUSY_PHASES: readonly ClaimVotePhase[] = [
  "starting",
  "pitch",
  "verify_x",
  "claiming",
  "confirming",
  "funding",
  "voting",
];

const TERMINAL_PHASES: readonly ClaimVotePhase[] = ["voted", "vote_failed", "payout_slow", "claim_failed", "ended"];

const RUNS_ON_AFTER_CLOSE: readonly ClaimVotePhase[] = ["claiming", "confirming", "funding", "voting"];

const ABORTABLE_PHASES: readonly ClaimVotePhase[] = ["starting", "verify_x", "claiming", "funding"];

const RETRYABLE_RESULTS: readonly XClaimResult["kind"][] = ["no_spots", "paused", "payout_failed"];

const isOtherTabSending = (outcome: VoteOutcome) => outcome.kind === "failed" && outcome.failure.kind === "in_flight";

export const canStartOwnVote = (run: ClaimVoteRun) => {
  switch (run.phase) {
    case "verify_x":
      return true;
    case "claim_failed":
      return run.retry.via !== "landing";
    case "ended":
      return (
        (run.ending.kind === "claim_outcome" || run.ending.kind === "landing_only") &&
        !isSettledResult(run.ending.result)
      );
    default:
      return false;
  }
};

export const isRunBusy = (run: ClaimVoteRun) => BUSY_PHASES.includes(run.phase);

export const isRunTerminal = (run: ClaimVoteRun) => TERMINAL_PHASES.includes(run.phase);

const to = (run: ClaimVoteRun, modal: ModalCommand = "keep", intent: IntentCommand = KEEP): Transition => ({
  run,
  modal,
  intent,
});

const ended = (ending: RunEnding, intent: IntentCommand = KEEP) => to({ phase: "ended", ending }, "open", intent);

const isPayout = (result: XClaimResult): result is Extract<XClaimResult, { kind: "paid" | "pending" }> =>
  result.kind === "paid" || result.kind === "pending";

const claimingVia = (via: ClaimPath, intent: IntentCommand) =>
  to({ phase: "claiming", via }, via === "worker" ? "open" : "keep", intent);

const closeTransition = (run: ClaimVoteRun): Transition | null => {
  if (run.phase === "idle") return null;
  if (RUNS_ON_AFTER_CLOSE.includes(run.phase)) return to(run, "close");
  if (run.phase === "verify_x") return to(IDLE_RUN, "close", CLEAR);
  const isUnsettledOutcome =
    run.phase === "ended" && run.ending.kind === "claim_outcome" && !isSettledResult(run.ending.result);
  return to(IDLE_RUN, "close", isUnsettledOutcome ? CLEAR : KEEP);
};

const plannedTransition = (run: Extract<ClaimVoteRun, { phase: "starting" }>, plan: StartPlan): Transition => {
  const prompt = (intent: VoteIntent) => to({ phase: "verify_x" }, "open", { kind: "save", intent });
  switch (plan.kind) {
    case "sign_in":
      return to({ phase: "pitch", choice: run.choice }, "open");
    case "verify_x":
      return prompt(plan.intent);
    case "go_x":
      return plan.intent.ownFundsCover
        ? prompt(plan.intent)
        : claimingVia("x_redirect", { kind: "save", intent: plan.intent });
    case "claim":
      return claimingVia("worker", { kind: "save", intent: plan.intent });
    case "refuse":
      return ended(plan.ending, plan.intent ? { kind: "save", intent: plan.intent } : CLEAR);
    default: {
      const exhaustive: never = plan;
      return exhaustive;
    }
  }
};

const settledTransition = (result: XClaimResult, now: number): Transition =>
  isPayout(result)
    ? to({ phase: "funding", payout: result.payout, until: now + PAYOUT_WINDOW_MS })
    : ended({ kind: "claim_outcome", result });

const retryTransition = (run: ClaimVoteRun, via: ClaimPath | null, now: number): Transition | null => {
  if (run.phase === "claim_failed") {
    const { retry } = run;
    if (retry.via === "landing") return to({ phase: "confirming", hint: retry.hint, landedAt: now }, "open", TOUCH);
    return claimingVia(retry.via, TOUCH);
  }
  if (run.phase !== "ended") return null;
  if (run.ending.kind === "claim_outcome" && via !== null) return claimingVia(via, TOUCH);
  return to(IDLE_RUN, "close");
};

export const isRetryableEnding = (ending: RunEnding) =>
  ending.kind === "claim_outcome" && RETRYABLE_RESULTS.includes(ending.result.kind);

export const transition = (run: ClaimVoteRun, event: ClaimVoteEvent, now: number): Transition | null => {
  switch (event.type) {
    case "close":
      return closeTransition(run);
    case "just_vote":
      return canStartOwnVote(run) ? to({ phase: "voting", payout: null }, "close", TOUCH) : null;
    case "reopen":
      return isRunBusy(run) ? to(run, "open") : null;
    case "abort":
      return ABORTABLE_PHASES.includes(run.phase) ? to(IDLE_RUN, "close") : null;
    case "start":
      return run.phase === "idle" ? to({ phase: "starting", choice: event.choice, origin: "tap" }) : null;
    case "finish":
      return run.phase === "idle" || run.phase === "vote_failed" || run.phase === "payout_slow"
        ? to({ phase: "funding", payout: event.payout, until: now + PAYOUT_WINDOW_MS }, "open", TOUCH)
        : null;
    case "landed":
      if (run.phase !== "idle") return null;
      return event.hint.kind === "x_cancelled"
        ? ended({ kind: "claim_outcome", result: event.hint })
        : to({ phase: "confirming", hint: event.hint, landedAt: event.at }, "open");
    case "planned":
      return run.phase === "starting" ? plannedTransition(run, event.plan) : null;
    case "signed_in":
      return run.phase === "pitch" ? to({ phase: "starting", choice: run.choice, origin: "after_sign_in" }) : null;
    case "verify":
      return run.phase === "verify_x" ? claimingVia("x_redirect", KEEP) : null;
    case "claim_settled":
      if (run.phase === "confirming" || (run.phase === "claiming" && run.via === "worker")) {
        return settledTransition(event.result, now);
      }
      return null;
    case "claim_failed":
      if (run.phase === "claiming") {
        if (run.via === "worker" && event.failure.reason === "not_linked") return to({ phase: "verify_x" }, "open");
        return to({ phase: "claim_failed", failure: event.failure, retry: { via: run.via } }, "open");
      }
      if (run.phase === "confirming") {
        return to({ phase: "claim_failed", failure: event.failure, retry: { via: "landing", hint: run.hint } }, "open");
      }
      return null;
    case "wallet_unavailable":
      return run.phase === "confirming" ? ended({ kind: "landing_only", result: run.hint }) : null;
    case "payout_updated":
      return run.phase === "funding" ? to({ ...run, payout: event.payout }) : null;
    case "payout_landed":
      return run.phase === "funding" ? to({ phase: "voting", payout: event.payout }) : null;
    case "payout_reverted":
      return run.phase === "funding" ? ended({ kind: "claim_outcome", result: { kind: "payout_failed" } }) : null;
    case "payout_slow":
      return run.phase === "funding" ? to({ phase: "payout_slow" }, "open") : null;
    case "vote_done": {
      if (run.phase !== "voting") return null;
      const { outcome } = event;
      if (run.payout === null) return to(IDLE_RUN, "close", isOtherTabSending(outcome) ? KEEP : CLEAR);
      if (outcome.kind === "voted") {
        return to(
          {
            phase: "voted",
            result: outcome.result,
            spentNative: outcome.spentNative,
            wantedNative: outcome.wantedNative,
          },
          "open",
          CLEAR,
        );
      }
      if (outcome.kind === "already_voted") {
        return to({ phase: "voted", result: null, spentNative: null, wantedNative: null }, "open", CLEAR);
      }
      return to({ phase: "vote_failed", failure: outcome.failure }, "open");
    }
    case "retry":
      return retryTransition(run, event.via, now);
    default: {
      const exhaustive: never = event;
      return exhaustive;
    }
  }
};

const refuse = (ending: RunEnding): StartDecision => ({ kind: "refuse", ending });

export const planStart = (facts: ClaimVoteFacts, origin: StartOrigin): StartDecision => {
  const { wallet, me, offer } = facts;
  if (wallet.kind === "signed_out") return { kind: "sign_in" };
  if (wallet.kind === "external") return refuse({ kind: "external_wallet" });
  const fromMe = me ? resultFromMe(me) : null;
  if (isSettledResult(fromMe)) return refuse({ kind: "claim_outcome", result: { kind: "wallet_claimed" } });
  if (me?.link && !me.link.eligible && fromMe) return refuse({ kind: "claim_outcome", result: fromMe });
  if (offer.status === "waiting") {
    const result: XClaimResult = offer.paused
      ? { kind: "paused" }
      : { kind: "no_spots", nextReleaseAt: offer.nextReleaseAt };
    return refuse({ kind: "claim_outcome", result });
  }
  if (offer.status === "off" && offer.reason === "settled") {
    return refuse({ kind: "claim_outcome", result: { kind: "wallet_claimed" } });
  }
  if (offer.status === "off") return refuse({ kind: "unavailable" });
  if (me?.link?.eligible) {
    if (me.canClaim) return { kind: "claim" };
    return refuse({
      kind: "claim_outcome",
      result: fromMe ?? { kind: "no_spots", nextReleaseAt: me.spots.nextReleaseAt },
    });
  }
  return origin === "after_sign_in" ? { kind: "verify_x" } : { kind: "go_x" };
};
