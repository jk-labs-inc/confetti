import type { Address } from "viem";
import { z } from "zod";
import { PARA_TOKEN_FALLBACK_LIFETIME_MS, PARA_TOKEN_REUSE_MARGIN_MS } from "./constants";

export type WalletProofHeader = string & { readonly __brand: "WalletProofHeader" };

type WalletProofPayload = { kind: "para"; jwt: string; address: Address };

const jwtPayloadSchema = z.object({ exp: z.number() });

const toBase64Url = (bytes: Uint8Array) =>
  btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join(""))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const fromBase64Url = (value: string) => {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  return atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "="));
};

const brandProof = (header: string): WalletProofHeader => header as WalletProofHeader;

export const encodeWalletProof = (payload: WalletProofPayload): WalletProofHeader =>
  brandProof(toBase64Url(new TextEncoder().encode(JSON.stringify(payload))));

const parseJwtSegment = (segment: string | undefined): unknown => {
  if (!segment) return null;
  try {
    return JSON.parse(fromBase64Url(segment));
  } catch {
    return null;
  }
};

const decodeJwt = (jwt: string) => {
  const [header, payload] = jwt.split(".");
  return { header: parseJwtSegment(header), payload: parseJwtSegment(payload) };
};

export const jwtExpiresAt = (jwt: string): number | null => {
  const parsed = jwtPayloadSchema.safeParse(decodeJwt(jwt).payload);
  return parsed.success ? parsed.data.exp * 1000 : null;
};

let cachedParaToken: { address: string; jwt: string; expiresAt: number } | null = null;

export const paraTokenCache = {
  read: ({ address, now }: { address: Address; now: number }) =>
    cachedParaToken &&
    cachedParaToken.address === address.toLowerCase() &&
    cachedParaToken.expiresAt - PARA_TOKEN_REUSE_MARGIN_MS > now
      ? cachedParaToken.jwt
      : null,
  write: ({ address, jwt, now }: { address: Address; jwt: string; now: number }) => {
    cachedParaToken = {
      address: address.toLowerCase(),
      jwt,
      expiresAt: jwtExpiresAt(jwt) ?? now + PARA_TOKEN_FALLBACK_LIFETIME_MS,
    };
  },
  clear: () => {
    cachedParaToken = null;
  },
};
