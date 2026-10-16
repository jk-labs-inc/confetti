import { isXClaimConfigured, xClaimWorkerUrl } from "@config/xClaim";
import { didUserReject } from "utils/error";
import { type Address, type Hash, isAddress, isHash } from "viem";
import { z } from "zod";
import {
  CLAIM_REQUEST_TIMEOUT_MS,
  CLAIM_STATUSES,
  ELIGIBILITY_REASONS,
  REQUEST_TIMEOUT_MS,
  WALLET_PROOF_HEADER,
  WORKER_ERROR_CODES,
  X_AUTHORIZE_HOSTS,
} from "./constants";
import { isMemberOf, isRejectReason, parseDate, resultFromCode } from "./outcomes";
import type { WalletProofHeader } from "./proof";
import type { ClaimMe, XClaimCheckStatus, XClaimFailure, XClaimNonce, XClaimResult, XClaimSpots } from "./types";

export class XClaimError extends Error {
  readonly failure: XClaimFailure;

  constructor(failure: XClaimFailure) {
    super(`x-claim ${failure.reason}: ${failure.detail}`);
    this.name = "XClaimError";
    this.failure = failure;
  }
}

const isoDate = z.string().transform((value, context) => {
  const date = parseDate(value);
  if (date) return date;
  context.addIssue({ code: "custom", message: "invalid date" });
  return z.NEVER;
});

const addressSchema = z.custom<Address>(value => typeof value === "string" && isAddress(value, { strict: false }));

const txHashSchema = z.custom<Hash>(value => typeof value === "string" && isHash(value));

const errorBodySchema = z.object({ error: z.enum(WORKER_ERROR_CODES) });

const spotsSchema = z.object({
  open: z.number(),
  dailyLimit: z.number(),
  usedToday: z.number(),
  nextReleaseAt: isoDate,
  paused: z.boolean(),
  usdAmount: z.string(),
  currency: z.string(),
  network: z.string(),
});

const nonceSchema = z
  .object({ nonce: z.string(), expiresAt: isoDate, chainId: z.number() })
  .transform(({ nonce, expiresAt, chainId }): XClaimNonce => ({ value: nonce, expiresAt, chainId }));

const startSchema = z.object({
  authorizeUrl: z.url().refine(value => {
    const url = new URL(value);
    return url.protocol === "https:" && isMemberOf(X_AUTHORIZE_HOSTS, url.hostname);
  }),
});

const checkStatus = (passed: boolean | null): XClaimCheckStatus => {
  if (passed === null) return "off";
  return passed ? "passed" : "failed";
};

const linkSchema = z
  .object({
    handle: z.string(),
    linkedAt: isoDate,
    verifiedType: z.string().nullable(),
    verifiedFollowersCount: z.number().nullable(),
    followersCount: z.number().nullable(),
    followingCount: z.number().nullable(),
    checks: z.object({ verified: z.boolean(), verifiedFollowers: z.boolean(), ratio: z.boolean().nullable() }),
    eligible: z.boolean(),
    rejectReason: z.string().nullable(),
  })
  .transform(link => ({
    handle: link.handle,
    linkedAt: link.linkedAt,
    verifiedType: link.verifiedType,
    checks: {
      verified: checkStatus(link.checks.verified),
      verifiedFollowers: checkStatus(link.checks.verifiedFollowers),
      ratio: checkStatus(link.checks.ratio),
    },
    stats: {
      verifiedFollowers: link.verifiedFollowersCount,
      followers: link.followersCount,
      following: link.followingCount,
    },
    eligible: link.eligible,
    rejectReason:
      link.rejectReason !== null && isMemberOf(ELIGIBILITY_REASONS, link.rejectReason) ? link.rejectReason : null,
  }));

const claimRecordSchema = z
  .object({
    status: z.enum(CLAIM_STATUSES),
    rejectReason: z.string().nullable(),
    txHash: txHashSchema.nullable(),
    tokenAmount: z.string().nullable(),
    usdAmount: z.string().nullable(),
    currency: z.string().nullable(),
    network: z.string().nullable(),
    createdAt: isoDate,
  })
  .transform(claim => ({
    status: claim.status,
    rejectReason: claim.rejectReason !== null && isRejectReason(claim.rejectReason) ? claim.rejectReason : null,
    payout: {
      txHash: claim.txHash,
      tokenAmount: claim.tokenAmount,
      usdAmount: claim.usdAmount,
      currency: claim.currency,
      network: claim.network,
    },
    createdAt: claim.createdAt,
  }));

const claimMeSchema = z.object({
  address: addressSchema,
  link: linkSchema.nullable(),
  claim: claimRecordSchema.nullable(),
  canClaim: z.boolean(),
  spots: z.object({ open: z.number(), nextReleaseAt: isoDate, paused: z.boolean() }),
});

const claimResultSchema = z
  .discriminatedUnion("outcome", [
    z.object({
      outcome: z.enum(["paid", "pending"]),
      txHash: txHashSchema,
      tokenAmount: z.string(),
      usdAmount: z.string(),
      currency: z.string(),
      network: z.string(),
    }),
    z.object({ outcome: z.literal("rejected"), reason: z.string(), nextReleaseAt: isoDate.optional() }),
    z.object({ outcome: z.literal("payout_failed") }),
  ])
  .transform((body, context): XClaimResult => {
    switch (body.outcome) {
      case "paid":
      case "pending":
        return {
          kind: body.outcome,
          payout: {
            txHash: body.txHash,
            tokenAmount: body.tokenAmount,
            usdAmount: body.usdAmount,
            currency: body.currency,
            network: body.network,
          },
        };
      case "rejected":
        if (isRejectReason(body.reason)) return resultFromCode(body.reason, { nextReleaseAt: body.nextReleaseAt });
        context.addIssue({ code: "custom", message: `unknown reject reason ${body.reason}` });
        return z.NEVER;
      case "payout_failed":
        return { kind: "payout_failed" };
      default: {
        const exhaustive: never = body;
        return exhaustive;
      }
    }
  });

const TRANSIENT_STATUSES = [408, 429];

const failureFromResponse = (status: number, body: unknown): XClaimFailure => {
  const parsed = errorBodySchema.safeParse(body);
  if (!parsed.success) {
    const transient = status >= 500 || TRANSIENT_STATUSES.includes(status);
    return { reason: transient ? "temporary" : "misconfigured", detail: `${status} unknown` };
  }
  const code = parsed.data.error;
  const detail = `${status} ${code}`;
  switch (code) {
    case "invalid_proof":
      return { reason: "wallet_proof", detail };
    case "not_linked":
      return { reason: "not_linked", detail };
    case "proof_unavailable":
    case "storage_unavailable":
    case "internal_error":
      return { reason: "temporary", detail };
    case "invalid_request":
    case "origin_not_allowed":
    case "not_found":
    case "server_misconfigured":
      return { reason: "misconfigured", detail };
    default: {
      const exhaustive: never = code;
      return exhaustive;
    }
  }
};

const isTimeout = (error: unknown) =>
  error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");

const readBody = async (response: Response): Promise<unknown> => {
  try {
    return await response.json();
  } catch (error) {
    if (isTimeout(error)) throw new XClaimError({ reason: "temporary", detail: "timeout reading response" });
    return null;
  }
};

const request = async <T>({
  path,
  init,
  schema,
  timeoutMs = REQUEST_TIMEOUT_MS,
}: {
  path: string;
  init: RequestInit;
  schema: z.ZodType<T>;
  timeoutMs?: number;
}): Promise<T> => {
  if (!isXClaimConfigured) throw new XClaimError({ reason: "misconfigured", detail: "not_configured" });

  let response: Response;
  try {
    response = await fetch(`${xClaimWorkerUrl}${path}`, { ...init, signal: AbortSignal.timeout(timeoutMs) });
  } catch (error) {
    throw new XClaimError({ reason: "temporary", detail: `network ${error instanceof Error ? error.name : "error"}` });
  }

  const body = await readBody(response);
  if (!response.ok) throw new XClaimError(failureFromResponse(response.status, body));

  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new XClaimError({ reason: "misconfigured", detail: `unexpected_response ${path}` });
  return parsed.data;
};

const proofHeaders = (proof: WalletProofHeader) => ({ [WALLET_PROOF_HEADER]: proof });

export const fetchSpots = (): Promise<XClaimSpots> =>
  request({ path: "/spots", init: { method: "GET" }, schema: spotsSchema });

export const requestNonce = (): Promise<XClaimNonce> =>
  request({ path: "/nonce", init: { method: "POST" }, schema: nonceSchema });

export const startXLogin = ({
  proof,
  returnPath,
}: {
  proof: WalletProofHeader;
  returnPath: string;
}): Promise<{ authorizeUrl: string }> =>
  request({
    path: "/x/start",
    init: {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", ...proofHeaders(proof) },
      body: JSON.stringify({ returnPath }),
    },
    schema: startSchema,
  });

export const fetchClaimMe = (proof: WalletProofHeader): Promise<ClaimMe> =>
  request({ path: "/claim/me", init: { method: "GET", headers: proofHeaders(proof) }, schema: claimMeSchema });

export const submitClaim = (proof: WalletProofHeader): Promise<XClaimResult> =>
  request({
    path: "/claim",
    init: { method: "POST", headers: proofHeaders(proof) },
    schema: claimResultSchema,
    timeoutMs: CLAIM_REQUEST_TIMEOUT_MS,
  });

export const toXClaimFailure = (error: unknown): XClaimFailure => {
  if (error instanceof XClaimError) return error.failure;
  if (didUserReject(error)) return { reason: "signature_rejected", detail: "user rejected the request" };
  return { reason: "temporary", detail: error instanceof Error ? error.message : "unknown error" };
};
