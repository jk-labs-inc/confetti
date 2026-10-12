export const X_CLAIM_CHECKS = ["verified", "verifiedFollowers", "ratio"] as const;

export const ELIGIBILITY_REASONS = ["not_verified", "no_verified_followers", "ratio"] as const;

export const REJECT_REASONS = [...ELIGIBILITY_REASONS, "x_linked_elsewhere", "wallet_claimed", "no_spots", "paused"] as const;

export const X_CANCELLED_CODES = ["x_denied", "x_browser_mismatch", "x_state_invalid", "x_error", "server_error"] as const;

export const OUTCOME_CODES = ["paid", "pending", "payout_failed", ...REJECT_REASONS, ...X_CANCELLED_CODES] as const;

export const CLAIM_STATUSES = ["pending", "paid", "failed", "rejected"] as const;

export const WORKER_ERROR_CODES = [
  "invalid_request",
  "invalid_proof",
  "origin_not_allowed",
  "not_found",
  "not_linked",
  "server_misconfigured",
  "internal_error",
  "proof_unavailable",
  "storage_unavailable",
] as const;

export const OUTCOME_PARAM = "x_claim";

export const REDIRECT_PARAMS = [OUTCOME_PARAM, "tx", "amount", "currency", "network", "next_release_at"] as const;

export const WALLET_PROOF_HEADER = "X-Wallet-Proof";

export const SIWE_STATEMENT = "Prove you own this wallet to claim $5 on Confetti.";

export const POLYGON_NETWORK = "polygon";

export const POLYGON_EXPLORER_TX_URL = "https://polygonscan.com/tx/";

export const MAX_RETURN_PATH_LENGTH = 512;

export const REQUEST_TIMEOUT_MS = 15_000;

export const CLAIM_REQUEST_TIMEOUT_MS = 45_000;

export const SPOTS_STALE_MS = 15_000;

export const PENDING_POLL_INTERVAL_MS = 5_000;

export const PENDING_POLL_WINDOW_MS = 60_000;

export const LANDING_WALLET_WAIT_MS = 15_000;

export const SIGN_IN_ARM_GRACE_MS = 60_000;

export const PARA_TOKEN_REUSE_MARGIN_MS = 60_000;

export const PARA_TOKEN_FALLBACK_LIFETIME_MS = 25 * 60_000;

export const SIGN_IN_LOG_LIMIT = 10;

export const MEMORY_KEY_PREFIX = "x_claim.v1.";

export const FLOW_STARTER_KEY = "x_claim.v1.flow_starter";

export const FLOW_STARTER_TTL_MS = 15 * 60_000;

export const X_AUTHORIZE_HOSTS = ["x.com", "twitter.com"] as const;
