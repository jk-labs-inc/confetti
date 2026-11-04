import type { CastVotesResult } from "@hooks/useCastVotes/types";
import type {
  ClaimMe,
  XClaimFailure,
  XClaimOffer,
  XClaimOpenOffer,
  XClaimPayout,
  XClaimResult,
  XClaimSheetView,
  XClaimSpots,
  XClaimWallet,
} from "lib/xClaim/types";
import type { Abi, Address, Hash } from "viem";

export interface ContestKey {
  chain: string;
  address: Address;
}

export interface ContestTarget {
  address: Address;
  abi: Abi;
  chainId: number;
  version: string;
}

export type ReceiptStatus = { status: "success"; blockNumber: bigint } | { status: "reverted" };

export interface VoteChoice {
  proposalId: string;
  entryTitle: string;
  amountNative: string;
}

export interface VoteIntent extends VoteChoice {
  ownFundsCover: boolean;
  ownFundsCanVote: boolean;
  spendableNative: string | null;
  wallet: Address;
  contest: ContestKey;
  votesBefore: string | null;
  sentTxHash: Hash | null;
  sendingAt: number | null;
  castingAt: number | null;
  createdAt: number;
  savedAt: number;
}

export type OwnFunds = Pick<VoteIntent, "ownFundsCover" | "ownFundsCanVote" | "spendableNative">;

export type ClaimPath = "worker" | "x_redirect";

export type ClaimRetry = { via: ClaimPath } | { via: "landing"; hint: XClaimResult };

export interface FundedPayout {
  txHash: Hash;
  receiptBlock: bigint;
  creditWei: bigint | null;
}

export type RunEnding =
  | { kind: "claim_outcome"; result: XClaimResult }
  | { kind: "landing_only"; result: XClaimResult }
  | { kind: "external_wallet" }
  | { kind: "unavailable" };

export type VoteFailure =
  | { kind: "no_intent" }
  | { kind: "voting_closed" }
  | { kind: "cannot_afford" }
  | { kind: "rejected" }
  | { kind: "in_flight" }
  | { kind: "credit_unknown" }
  | { kind: "error"; message: string };

export type VoteOutcome =
  | { kind: "voted"; result: CastVotesResult; spentNative: string; wantedNative: string | null }
  | { kind: "already_voted" }
  | { kind: "failed"; failure: VoteFailure; isShown?: boolean };

export type ClaimVoteRun =
  | { phase: "idle" }
  | { phase: "starting"; choice: VoteChoice }
  | { phase: "pitch"; choice: VoteChoice }
  | { phase: "verify_x" }
  | { phase: "claiming"; via: ClaimPath }
  | { phase: "confirming"; hint: XClaimResult; landedAt: number }
  | { phase: "funding"; payout: XClaimPayout; until: number }
  | { phase: "voting"; payout: FundedPayout | null; fallback?: XClaimResult }
  | {
      phase: "voted";
      result: CastVotesResult | null;
      spentNative: string | null;
      wantedNative: string | null;
      isFallback?: boolean;
    }
  | { phase: "vote_failed"; failure: VoteFailure }
  | { phase: "payout_slow" }
  | { phase: "claim_failed"; failure: XClaimFailure; retry: ClaimRetry }
  | { phase: "ended"; ending: RunEnding };

export type ClaimVotePhase = ClaimVoteRun["phase"];

export type StartDecision =
  { kind: "sign_in" } | { kind: "verify_x" | "claim" } | { kind: "refuse"; ending: RunEnding };

export type StartPlan =
  | { kind: "sign_in" }
  | { kind: "verify_x" | "claim"; intent: VoteIntent }
  | { kind: "refuse"; ending: RunEnding; intent: VoteIntent | null };

export type ClaimVoteEvent =
  | { type: "start"; choice: VoteChoice }
  | { type: "finish"; payout: XClaimPayout }
  | { type: "verify" }
  | { type: "retry"; via: ClaimPath | null }
  | { type: "close" }
  | { type: "just_vote" }
  | { type: "reopen" }
  | { type: "planned"; plan: StartPlan }
  | { type: "signed_in" }
  | { type: "landed"; hint: XClaimResult; at: number }
  | { type: "claim_settled"; result: XClaimResult; canFallBack: boolean }
  | { type: "claim_failed"; failure: XClaimFailure }
  | { type: "wallet_unavailable" }
  | { type: "payout_updated"; payout: XClaimPayout }
  | { type: "payout_landed"; payout: FundedPayout }
  | { type: "payout_reverted" }
  | { type: "payout_slow" }
  | { type: "vote_done"; outcome: VoteOutcome }
  | { type: "abort" };

export type IntentCommand =
  { kind: "keep" } | { kind: "save"; intent: VoteIntent } | { kind: "touch" } | { kind: "clear" };

export type ModalCommand = "open" | "close" | "keep";

export interface Transition {
  run: ClaimVoteRun;
  modal: ModalCommand;
  intent: IntentCommand;
}

export interface ClaimVoteCasterMount {
  intent: VoteIntent;
  payout: FundedPayout | null;
  isSilent: boolean;
  step: number;
}

export interface ClaimVoteFacts {
  contest: ContestKey;
  wallet: XClaimWallet;
  spots: XClaimSpots | null;
  spotsFailed: boolean;
  me: ClaimMe | null;
  meUpdatedAt: number;
  meFailedAt: number;
  meSettled: boolean;
  offer: XClaimOffer;
  intent: VoteIntent | null;
}

export type CreditGate = "covers" | "too_expensive" | "unknown";

export type VoteSize =
  { votes: number; valueWei: bigint; wantedMore: boolean } | { votes: 0; reason: "cannot_afford" | "no_price" };

export type ClaimVoteBoard =
  "VoteRunning" | "VoteDone" | "VoteFallbackDone" | "VoteFinish" | "PayoutSlow" | "CheckFailed" | "ExternalWalletInfo";

export type LandingTaker = "run" | "sheet";

export type ClaimVoteLine = { kind: "hidden" } | { kind: "offer"; offer: XClaimOpenOffer } | { kind: "busy" };

export type ClaimVoteModalView =
  | { kind: "claim_board"; view: XClaimSheetView }
  | { kind: "running"; isFallback: boolean }
  | { kind: "voted"; result: CastVotesResult | null; spentNative: string | null; wantedNative: string | null }
  | { kind: "fallback_voted"; result: CastVotesResult | null; spentNative: string | null }
  | { kind: "finish"; entryTitle: string; failure: VoteFailure }
  | { kind: "payout_slow"; entryTitle: string }
  | { kind: "check_failed" }
  | { kind: "external_info" };
