import type { Address } from "viem";
import type {
  CLAIM_STATUSES,
  ELIGIBILITY_REASONS,
  OUTCOME_CODES,
  REJECT_REASONS,
  WORKER_ERROR_CODES,
  X_CANCELLED_CODES,
  X_CLAIM_CHECKS,
} from "./constants";

export type XClaimCheck = (typeof X_CLAIM_CHECKS)[number];
export type EligibilityReason = (typeof ELIGIBILITY_REASONS)[number];
export type RejectReason = (typeof REJECT_REASONS)[number];
export type OutcomeCode = (typeof OUTCOME_CODES)[number];
export type ClaimStatus = (typeof CLAIM_STATUSES)[number];
export type WorkerErrorCode = (typeof WORKER_ERROR_CODES)[number];
export type XCancelledReason = (typeof X_CANCELLED_CODES)[number] | "unrecognized";

export type TxHash = `0x${string}`;

export type XClaimCheckStatus = "passed" | "failed" | "unknown" | "off";
export type XClaimChecks = Readonly<Record<XClaimCheck, XClaimCheckStatus>>;

export interface XAccountStats {
  verifiedFollowers: number | null;
  followers: number | null;
  following: number | null;
}

export interface XClaimSpots {
  open: number;
  dailyLimit: number;
  usedToday: number;
  nextReleaseAt: Date;
  paused: boolean;
  usdAmount: string;
  currency: string;
  network: string;
}

export interface XClaimNonce {
  value: string;
  expiresAt: Date;
  chainId: number;
}

export interface XClaimPayout {
  txHash: TxHash | null;
  tokenAmount: string | null;
  usdAmount: string | null;
  currency: string | null;
  network: string | null;
  explorerUrl: string | null;
}

export interface XLink {
  handle: string;
  linkedAt: Date;
  verifiedType: string | null;
  checks: XClaimChecks;
  stats: XAccountStats;
  eligible: boolean;
  rejectReason: EligibilityReason | null;
}

export interface XClaimRecord {
  status: ClaimStatus;
  rejectReason: RejectReason | null;
  payout: XClaimPayout;
  createdAt: Date;
}

export interface ClaimMe {
  address: Address;
  link: XLink | null;
  claim: XClaimRecord | null;
  canClaim: boolean;
  spots: { open: number; nextReleaseAt: Date; paused: boolean };
}

export type XClaimResult =
  | { kind: "paid"; payout: XClaimPayout }
  | { kind: "pending"; payout: XClaimPayout }
  | { kind: "payout_failed" }
  | { kind: "not_eligible"; failedCheck: XClaimCheck }
  | { kind: "x_linked_elsewhere" }
  | { kind: "wallet_claimed" }
  | { kind: "no_spots"; nextReleaseAt: Date | null }
  | { kind: "paused" }
  | { kind: "x_cancelled"; reason: XCancelledReason };

export type XClaimWallet =
  | { kind: "signed_out" }
  | { kind: "embedded"; address: Address; signedInWithX: boolean }
  | { kind: "external"; address: Address; walletName: string | null };

export type XClaimSignedInWallet = Exclude<XClaimWallet, { kind: "signed_out" }>;
export type XClaimEmbeddedWallet = Extract<XClaimWallet, { kind: "embedded" }>;

export type XClaimFailureReason =
  | "signature_rejected"
  | "wallet_proof"
  | "signed_out"
  | "not_linked"
  | "temporary"
  | "misconfigured";

export interface XClaimFailure {
  reason: XClaimFailureReason;
  detail: string;
}

export type XClaimActionName = "start_x" | "retry_claim" | "check_status";
export type XClaimActionStage = "idle" | "awaiting_signature" | "submitting" | "redirecting";

export interface XClaimActionState {
  stage: XClaimActionStage;
  error: XClaimFailure | null;
}

export type XClaimNoSpotsCause = { kind: "no_spots"; nextReleaseAt: Date | null } | { kind: "paused" };

export type XClaimBoardView =
  | { board: "ClaimStart" }
  | { board: "ClaimConfirmX" }
  | { board: "ClaimExternalWallet"; activeStep: 1 | 2 }
  | { board: "ClaimLinked"; handle: string | null }
  | { board: "Checking"; handle: string | null }
  | { board: "Success"; payout: XClaimPayout; confirming: boolean }
  | { board: "NotEligible"; handle: string | null; checks: XClaimChecks; stats: XAccountStats | null }
  | { board: "AlreadyLinked" }
  | { board: "AlreadyClaimed"; handle: string | null; usdAmount: string | null; claimedAt: Date | null }
  | { board: "NoSpots"; handle: string | null; cause: XClaimNoSpotsCause; canClaimNow: boolean }
  | { board: "PayoutFailed"; handle: string | null; usdAmount: string | null }
  | { board: "XCancelled"; reason: XCancelledReason };

export type XClaimBoard = XClaimBoardView["board"];

export interface XClaimSheetCommon {
  wallet: XClaimWallet;
  spots: XClaimSpots | null;
  action: XClaimActionState;
  fromRedirectOnly: boolean;
}

export type XClaimSheetView = XClaimSheetCommon & XClaimBoardView;

export type XClaimOfferAudience = "signed_out" | "signed_in";

export type XClaimOffer =
  | { status: "off"; reason: "not_configured" | "loading" | "unavailable" | "settled" }
  | { status: "waiting"; audience: XClaimOfferAudience; nextReleaseAt: Date; paused: boolean }
  | { status: "open"; audience: XClaimOfferAudience; spots: XClaimSpots };

export interface XClaimActions {
  open: () => void;
  close: () => void;
  startXClaim: (returnPath?: string) => Promise<void>;
  retryClaim: () => Promise<void>;
  checkStatus: () => Promise<void>;
}

export type XClaimMemory = "settled" | "retryable";

export interface XClaimFlowResult {
  result: XClaimResult;
  source: "redirect" | "worker";
  at: number;
  walletWaitOver: boolean;
  startedBy: string | null;
}

export interface XClaimFlowAction extends XClaimActionState {
  name: XClaimActionName | null;
}

export interface XClaimInput {
  configured: boolean;
  wallet: XClaimWallet;
  spots: XClaimSpots | null;
  spotsFailed: boolean;
  me: ClaimMe | null;
  meUpdatedAt: number;
  meFailedAt: number;
  meLoading: boolean;
  memory: XClaimMemory | null;
  result: XClaimFlowResult | null;
  action: XClaimFlowAction;
}
