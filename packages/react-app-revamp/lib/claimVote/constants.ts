import { PENDING_POLL_WINDOW_MS } from "lib/xClaim/constants";

export const INTENT_KEY = "claim_vote.v1.intent";

export const INTENT_TTL_MS = 15 * 60_000;

export const CLAIM_CLOCK_SKEW_MS = 5 * 60_000;

export const PAYOUT_WINDOW_MS = PENDING_POLL_WINDOW_MS;

export const PRICE_WINDOW_GUARD_S = 8;

export const PRICE_SETTLE_PAD_S = 2;

export const RECEIPT_CONFIRMATIONS = 1;

export const SENT_VOTE_RECEIPT_TIMEOUT_MS = 60_000;

export const BLOCK_CATCH_UP_TIMEOUT_MS = 15_000;

export const BLOCK_CATCH_UP_POLL_MS = 1_000;

export const VOTING_WATCHDOG_MS = 120_000;

export const SENDING_GUARD_MS = 2 * 60_000;
