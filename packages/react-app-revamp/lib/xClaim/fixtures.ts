import { OUTCOME_CODES } from "./constants";
import { EMPTY_PAYOUT, resultFromCode, toPayout } from "./outcomes";
import type {
  ClaimMe,
  ClaimStatus,
  OutcomeCode,
  RejectReason,
  XClaimBoard,
  XClaimFlowAction,
  XClaimInput,
  XClaimPayout,
  XClaimSheetView,
  XClaimSpots,
  XClaimWallet,
  XLink,
} from "./types";
import { deriveView } from "./view";

export interface XClaimFixture {
  id: string;
  expected: XClaimBoard;
  view: XClaimSheetView;
}

const BOARDS = {
  ClaimStart: true,
  ClaimConfirmX: true,
  ClaimExternalWallet: true,
  ClaimLinked: true,
  Checking: true,
  Success: true,
  NotEligible: true,
  AlreadyLinked: true,
  AlreadyClaimed: true,
  NoSpots: true,
  PayoutFailed: true,
  XCancelled: true,
} as const satisfies Record<XClaimBoard, true>;

export const X_CLAIM_BOARDS = Object.keys(BOARDS).filter((board): board is XClaimBoard => board in BOARDS);

const NOW = Date.UTC(2026, 9, 12, 12, 0, 0);
const LANDED_AT = NOW;
const AFTER_LANDING = NOW + 1_000;
const SAMPLE_ADDRESS = "0x7a3F3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e91c2";
const SAMPLE_TX = "0x5f2c8a91d3b47e60a1c9f8e7d6b5a4c3b2a1908f7e6d5c4b3a29180f7e6d5c4b";

const SPOTS: XClaimSpots = {
  open: 7,
  dailyLimit: 20,
  usedToday: 13,
  nextReleaseAt: new Date(NOW + 6 * 60 * 60_000),
  paused: false,
  usdAmount: "5",
  currency: "POL",
  network: "polygon",
};

const EMBEDDED: XClaimWallet = { kind: "embedded", address: SAMPLE_ADDRESS, signedInWithX: false };
const EMBEDDED_X: XClaimWallet = { kind: "embedded", address: SAMPLE_ADDRESS, signedInWithX: true };
const EXTERNAL: XClaimWallet = { kind: "external", address: SAMPLE_ADDRESS, walletName: "MetaMask" };

const IDLE: XClaimFlowAction = { name: null, stage: "idle", error: null };

const PAYOUT: XClaimPayout = toPayout({
  txHash: SAMPLE_TX,
  tokenAmount: "48.503191",
  usdAmount: "5",
  currency: "POL",
  network: "polygon",
});

const REDIRECT_PAYOUT: XClaimPayout = { ...PAYOUT, usdAmount: null };

const PASSING_LINK: XLink = {
  handle: "bubbles",
  linkedAt: new Date(NOW - 60_000),
  verifiedType: "blue",
  checks: { verified: "passed", verifiedFollowers: "passed", ratio: "passed" },
  stats: { verifiedFollowers: 3, followers: 400, following: 300 },
  eligible: true,
  rejectReason: null,
};

const failingLink = (reason: "not_verified" | "no_verified_followers" | "ratio"): XLink => ({
  ...PASSING_LINK,
  verifiedType: reason === "not_verified" ? "none" : "blue",
  checks: {
    verified: reason === "not_verified" ? "failed" : "passed",
    verifiedFollowers: reason === "no_verified_followers" ? "failed" : "passed",
    ratio: reason === "ratio" ? "failed" : "passed",
  },
  stats: {
    verifiedFollowers: reason === "no_verified_followers" ? 0 : 3,
    followers: reason === "ratio" ? 40 : 400,
    following: reason === "ratio" ? 900 : 300,
  },
  eligible: false,
  rejectReason: reason,
});

const claimRecord = (status: ClaimStatus, rejectReason: RejectReason | null = null) => ({
  status,
  rejectReason,
  payout: status === "paid" || status === "pending" ? PAYOUT : EMPTY_PAYOUT,
  createdAt: new Date(NOW - 30_000),
});

const sampleMe = (overrides: Partial<ClaimMe>): ClaimMe => ({
  address: SAMPLE_ADDRESS,
  link: PASSING_LINK,
  claim: null,
  canClaim: false,
  spots: { open: SPOTS.open, nextReleaseAt: SPOTS.nextReleaseAt, paused: false },
  ...overrides,
});

const confirmingMeFor = (code: OutcomeCode): ClaimMe | null => {
  switch (code) {
    case "paid":
    case "pending":
      return sampleMe({ claim: claimRecord(code) });
    case "payout_failed":
      return sampleMe({ claim: claimRecord("failed"), canClaim: true });
    case "not_verified":
    case "no_verified_followers":
    case "ratio":
      return sampleMe({ link: failingLink(code), claim: claimRecord("rejected", code) });
    case "x_linked_elsewhere":
      return sampleMe({ link: null, claim: claimRecord("rejected", code) });
    case "wallet_claimed":
      return sampleMe({ claim: claimRecord("paid") });
    case "no_spots":
      return sampleMe({
        claim: claimRecord("rejected", code),
        spots: { open: 0, nextReleaseAt: SPOTS.nextReleaseAt, paused: false },
      });
    case "paused":
      return sampleMe({
        claim: claimRecord("rejected", code),
        spots: { open: 0, nextReleaseAt: SPOTS.nextReleaseAt, paused: true },
      });
    case "x_denied":
    case "x_browser_mismatch":
    case "x_state_invalid":
    case "x_error":
    case "server_error":
      return null;
    default: {
      const exhaustive: never = code;
      return exhaustive;
    }
  }
};

const BOARD_FOR_CODE: Readonly<Record<OutcomeCode, XClaimBoard>> = {
  paid: "Success",
  pending: "Success",
  payout_failed: "PayoutFailed",
  not_verified: "NotEligible",
  no_verified_followers: "NotEligible",
  ratio: "NotEligible",
  x_linked_elsewhere: "AlreadyLinked",
  wallet_claimed: "AlreadyClaimed",
  no_spots: "NoSpots",
  paused: "NoSpots",
  x_denied: "XCancelled",
  x_browser_mismatch: "XCancelled",
  x_state_invalid: "XCancelled",
  x_error: "XCancelled",
  server_error: "XCancelled",
};

const redirectResultFor = (code: OutcomeCode) =>
  resultFromCode(code, { payout: REDIRECT_PAYOUT, nextReleaseAt: SPOTS.nextReleaseAt });

const input = (overrides: Partial<XClaimInput>): XClaimInput => ({
  configured: true,
  wallet: EMBEDDED,
  spots: SPOTS,
  spotsFailed: false,
  me: null,
  meUpdatedAt: 0,
  meFailedAt: 0,
  meLoading: false,
  memory: null,
  result: null,
  action: IDLE,
  ...overrides,
});

const landing = (code: OutcomeCode) => ({
  result: redirectResultFor(code),
  source: "redirect" as const,
  at: LANDED_AT,
  walletWaitOver: true,
  startedBy: SAMPLE_ADDRESS.toLowerCase(),
});

const fixture = (id: string, expected: XClaimBoard, overrides: Partial<XClaimInput>): XClaimFixture => ({
  id,
  expected,
  view: deriveView(input(overrides)),
});

const offerFixtures = [
  fixture("offer · embedded · connect x", "ClaimStart", {}),
  fixture("offer · embedded · spots loading", "ClaimStart", { spots: null }),
  fixture("offer · signed in with x", "ClaimConfirmX", { wallet: EMBEDDED_X }),
  fixture("offer · external · idle", "ClaimExternalWallet", { wallet: EXTERNAL }),
  fixture("offer · external · awaiting signature", "ClaimExternalWallet", {
    wallet: EXTERNAL,
    action: { name: "start_x", stage: "awaiting_signature", error: null },
  }),
  fixture("offer · external · signed, redirecting", "ClaimExternalWallet", {
    wallet: EXTERNAL,
    action: { name: "start_x", stage: "redirecting", error: null },
  }),
  fixture("offer · external · signature rejected", "ClaimExternalWallet", {
    wallet: EXTERNAL,
    action: { name: "start_x", stage: "idle", error: { reason: "signature_rejected", detail: "user rejected" } },
  }),
  fixture("offer · embedded · wallet proof rejected", "ClaimStart", {
    action: { name: "start_x", stage: "idle", error: { reason: "wallet_proof", detail: "401 invalid_proof" } },
  }),
  fixture("offer · embedded · linked, spot open", "ClaimLinked", {
    me: sampleMe({ claim: claimRecord("rejected", "no_spots"), canClaim: true }),
    meUpdatedAt: AFTER_LANDING,
  }),
  fixture("offer · embedded · linked, no spots", "NoSpots", {
    me: sampleMe({ spots: { open: 0, nextReleaseAt: SPOTS.nextReleaseAt, paused: false } }),
    meUpdatedAt: AFTER_LANDING,
  }),
  fixture("offer · embedded · already paid", "AlreadyClaimed", { me: sampleMe({ claim: claimRecord("paid") }), meUpdatedAt: AFTER_LANDING }),
  fixture("offer · external · remembered retryable", "ClaimLinked", { wallet: EXTERNAL, memory: "retryable" }),
  fixture("offer · external · remembered settled", "AlreadyClaimed", { wallet: EXTERNAL, memory: "settled" }),
];

const landingFixtures = OUTCOME_CODES.flatMap(code => [
  fixture(`landing · ${code} · embedded confirmed`, BOARD_FOR_CODE[code], {
    result: landing(code),
    me: confirmingMeFor(code),
    meUpdatedAt: confirmingMeFor(code) ? AFTER_LANDING : 0,
    meFailedAt: confirmingMeFor(code) ? 0 : AFTER_LANDING,
  }),
  fixture(`landing · ${code} · external hint only`, BOARD_FOR_CODE[code], { wallet: EXTERNAL, result: landing(code) }),
]);

const flowFixtures = [
  fixture("landing · unrecognized code", "XCancelled", {
    result: { ...landing("x_denied"), result: { kind: "x_cancelled", reason: "unrecognized" } },
  }),
  fixture("landing · embedded · confirming with /claim/me", "Checking", {
    result: { ...landing("paid"), walletWaitOver: false },
  }),
  fixture("landing · embedded · /claim/me failed, hint shown", "Success", { result: landing("paid"), meFailedAt: AFTER_LANDING }),
  fixture("landing · embedded · forged paid falls back to the offer", "ClaimStart", {
    result: landing("paid"),
    me: sampleMe({ link: null }),
    meUpdatedAt: AFTER_LANDING,
  }),
  fixture("landing · wallet still restoring", "Checking", {
    wallet: { kind: "signed_out" },
    result: { ...landing("paid"), walletWaitOver: false },
  }),
  fixture("landing · wallet_claimed on a paid wallet", "AlreadyClaimed", {
    result: landing("wallet_claimed"),
    me: sampleMe({ claim: claimRecord("paid") }),
    meUpdatedAt: AFTER_LANDING,
  }),
  fixture("landing · external · no spots, spots open again", "NoSpots", {
    wallet: EXTERNAL,
    result: landing("no_spots"),
  }),
  fixture("retry · submitting", "Checking", {
    me: sampleMe({ claim: claimRecord("failed"), canClaim: true }),
    meUpdatedAt: AFTER_LANDING,
    action: { name: "retry_claim", stage: "submitting", error: null },
  }),
  fixture("retry · temporary failure on payout failed", "PayoutFailed", {
    result: landing("payout_failed"),
    me: sampleMe({ claim: claimRecord("failed"), canClaim: true }),
    meUpdatedAt: AFTER_LANDING,
    action: { name: "retry_claim", stage: "idle", error: { reason: "temporary", detail: "503 storage_unavailable" } },
  }),
  fixture("retry · worker answered pending", "Success", {
    result: {
      result: redirectResultFor("pending"),
      source: "worker",
      at: LANDED_AT,
      walletWaitOver: true,
      startedBy: null,
    },
  }),
];

export const XCLAIM_FIXTURES: readonly XClaimFixture[] = [...offerFixtures, ...landingFixtures, ...flowFixtures];

export const boardsWithoutFixture = (fixtures: readonly XClaimFixture[]) =>
  X_CLAIM_BOARDS.filter(board => !fixtures.some(entry => entry.view.board === board));

export const fixturesOffExpectation = (fixtures: readonly XClaimFixture[]) =>
  fixtures.filter(entry => entry.view.board !== entry.expected);

export const sampleRedirectHref = (code: string, path: string) => {
  const params = new URLSearchParams({ x_claim: code });
  if (code === "paid" || code === "pending") {
    params.set("tx", SAMPLE_TX);
    params.set("amount", "0.998801");
    params.set("currency", "POL");
    params.set("network", "polygon");
  }
  if (code === "no_spots") params.set("next_release_at", new Date(Date.now() + 3 * 60 * 60_000).toISOString());
  return `${path}?${params.toString()}`;
};
