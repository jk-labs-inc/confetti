import {
  MAX_RETURN_PATH_LENGTH,
  OUTCOME_CODES,
  OUTCOME_PARAM,
  POLYGON_EXPLORER_TX_URL,
  POLYGON_NETWORK,
  REDIRECT_PARAMS,
  REJECT_REASONS,
  X_CLAIM_CHECKS,
} from "./constants";
import type {
  ClaimMe,
  EligibilityReason,
  OutcomeCode,
  RejectReason,
  TxHash,
  XClaimCheck,
  XClaimCheckStatus,
  XClaimChecks,
  XClaimPayout,
  XClaimResult,
} from "./types";

const TX_HASH_PATTERN = /^0x[0-9a-fA-F]{64}$/;
const DECIMAL_PATTERN = /^\d+(\.\d+)?$/;
const LABEL_PATTERN = /^[A-Za-z0-9_-]{1,32}$/;
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/;

export const ELIGIBILITY_CHECK: Readonly<Record<EligibilityReason, XClaimCheck>> = {
  not_verified: "verified",
  no_verified_followers: "verifiedFollowers",
  ratio: "ratio",
};

export const EMPTY_PAYOUT: XClaimPayout = {
  txHash: null,
  tokenAmount: null,
  usdAmount: null,
  currency: null,
  network: null,
  explorerUrl: null,
};

export const isMemberOf = <T extends string>(list: readonly T[], value: string): value is T =>
  list.some(member => member === value);

export const isOutcomeCode = (value: string): value is OutcomeCode => isMemberOf(OUTCOME_CODES, value);

export const isRejectReason = (value: string): value is RejectReason => isMemberOf(REJECT_REASONS, value);

export const isTxHash = (value: string): value is TxHash => TX_HASH_PATTERN.test(value);

export const isDecimalAmount = (value: string) => DECIMAL_PATTERN.test(value);

export const explorerTxUrl = ({ txHash, network }: { txHash: TxHash | null; network: string | null }) =>
  txHash && network === POLYGON_NETWORK ? `${POLYGON_EXPLORER_TX_URL}${txHash}` : null;

export const toPayout = (fields: Omit<XClaimPayout, "explorerUrl">): XClaimPayout => ({
  ...fields,
  explorerUrl: explorerTxUrl(fields),
});

export const parseDate = (value: string | null): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const resultFromCode = (
  code: OutcomeCode,
  extras: { payout?: XClaimPayout; nextReleaseAt?: Date | null } = {},
): XClaimResult => {
  switch (code) {
    case "paid":
    case "pending":
      return { kind: code, payout: extras.payout ?? EMPTY_PAYOUT };
    case "payout_failed":
      return { kind: "payout_failed" };
    case "not_verified":
    case "no_verified_followers":
    case "ratio":
      return { kind: "not_eligible", failedCheck: ELIGIBILITY_CHECK[code] };
    case "x_linked_elsewhere":
      return { kind: "x_linked_elsewhere" };
    case "wallet_claimed":
      return { kind: "wallet_claimed" };
    case "no_spots":
      return { kind: "no_spots", nextReleaseAt: extras.nextReleaseAt ?? null };
    case "paused":
      return { kind: "paused" };
    case "x_denied":
    case "x_browser_mismatch":
    case "x_state_invalid":
    case "x_error":
    case "server_error":
      return { kind: "x_cancelled", reason: code };
    default: {
      const exhaustive: never = code;
      return exhaustive;
    }
  }
};

const readLabel = (params: URLSearchParams, name: string) => {
  const value = params.get(name);
  return value && LABEL_PATTERN.test(value) ? value : null;
};

const payoutFromParams = (params: URLSearchParams): XClaimPayout => {
  const tx = params.get("tx");
  const amount = params.get("amount");
  return toPayout({
    txHash: tx && isTxHash(tx) ? tx : null,
    tokenAmount: amount && isDecimalAmount(amount) ? amount : null,
    usdAmount: null,
    currency: readLabel(params, "currency"),
    network: readLabel(params, "network"),
  });
};

export interface RedirectLanding {
  code: string;
  result: XClaimResult;
  cleanUrl: string;
}

export const parseRedirect = (href: string): RedirectLanding | null => {
  const url = new URL(href);
  const code = url.searchParams.get(OUTCOME_PARAM);
  if (code === null) return null;

  const result: XClaimResult = isOutcomeCode(code)
    ? resultFromCode(code, {
        payout: payoutFromParams(url.searchParams),
        nextReleaseAt: parseDate(url.searchParams.get("next_release_at")),
      })
    : { kind: "x_cancelled", reason: "unrecognized" };

  REDIRECT_PARAMS.forEach(name => url.searchParams.delete(name));
  const search = url.searchParams.toString();
  return { code, result, cleanUrl: `${url.pathname}${search ? `?${search}` : ""}${url.hash}` };
};

const isPayoutResult = (result: XClaimResult | null) => result?.kind === "paid" || result?.kind === "pending";

export const resultFromMe = (me: ClaimMe): XClaimResult | null => {
  const { claim, link } = me;
  if (!claim) {
    return link && !link.eligible && link.rejectReason
      ? { kind: "not_eligible", failedCheck: ELIGIBILITY_CHECK[link.rejectReason] }
      : null;
  }
  switch (claim.status) {
    case "paid":
    case "pending":
      return { kind: claim.status, payout: claim.payout };
    case "failed":
      return { kind: "payout_failed" };
    case "rejected":
      return claim.rejectReason ? resultFromCode(claim.rejectReason, { nextReleaseAt: me.spots.nextReleaseAt }) : null;
    default: {
      const exhaustive: never = claim.status;
      return exhaustive;
    }
  }
};

export const confirmOutcome = (hint: XClaimResult, me: ClaimMe): XClaimResult | null => {
  if (hint.kind === "x_cancelled") return hint;
  const fromMe = resultFromMe(me);
  if (isPayoutResult(fromMe) && !isPayoutResult(hint)) return { kind: "wallet_claimed" };
  return fromMe;
};

export const isSettledResult = (result: XClaimResult | null) =>
  isPayoutResult(result) || result?.kind === "wallet_claimed";

export const checksImpliedBy = (failedCheck: XClaimCheck): XClaimChecks => {
  const failedIndex = X_CLAIM_CHECKS.indexOf(failedCheck);
  const statusOf = (check: XClaimCheck): XClaimCheckStatus => {
    const index = X_CLAIM_CHECKS.indexOf(check);
    if (index < failedIndex) return "passed";
    return index === failedIndex ? "failed" : "unknown";
  };
  return { verified: statusOf("verified"), verifiedFollowers: statusOf("verifiedFollowers"), ratio: statusOf("ratio") };
};

const isSafeReturnPath = (path: string) =>
  path.startsWith("/") &&
  !path.startsWith("//") &&
  !path.includes("\\") &&
  !CONTROL_CHARACTERS.test(path) &&
  path.length <= MAX_RETURN_PATH_LENGTH;

export const safeReturnPath = ({ preferred, fallback }: { preferred: string; fallback: string }) =>
  [preferred, fallback].find(isSafeReturnPath) ?? "/";
