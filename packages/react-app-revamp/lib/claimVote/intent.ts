import { isDecimalAmount } from "lib/xClaim/outcomes";
import type { XClaimRecord, XClaimWallet } from "lib/xClaim/types";
import { type Address, type Hash, isAddress, isHash } from "viem";
import { z } from "zod";
import { CLAIM_CLOCK_SKEW_MS, INTENT_TTL_MS } from "./constants";
import type { ContestKey, VoteChoice, VoteIntent } from "./types";

const lowerAddress = z
  .string()
  .refine(value => isAddress(value, { strict: false }))
  .transform(value => value.toLowerCase() as Address);

const intentSchema = z.object({
  proposalId: z.string().regex(/^\d+$/),
  entryTitle: z.string(),
  amountNative: z.string().refine(value => value === "" || isDecimalAmount(value)),
  wallet: lowerAddress,
  contest: z.object({
    chain: z
      .string()
      .min(1)
      .transform(value => value.toLowerCase()),
    address: lowerAddress,
  }),
  votesBefore: z.string().regex(/^\d+$/).nullable(),
  sentTxHash: z.custom<Hash>(value => typeof value === "string" && isHash(value)).nullable(),
  sendingAt: z.number().nullable().default(null),
  createdAt: z.number(),
  savedAt: z.number(),
});

export const parseIntent = (raw: unknown): VoteIntent | null => {
  const parsed = intentSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
};

export const contestKeyOf = ({ chain, address }: { chain: string; address: string }): ContestKey => ({
  chain: chain.toLowerCase(),
  address: address.toLowerCase() as Address,
});

const TYPED_AMOUNT_PATTERN = /^\d*\.?\d*$/;

export const normalizedAmount = (typed: string) => {
  const value = typed.trim().replace(",", ".");
  if (!TYPED_AMOUNT_PATTERN.test(value) || !/\d/.test(value)) return "";
  const withLeadingZero = value.startsWith(".") ? `0${value}` : value;
  return withLeadingZero.endsWith(".") ? withLeadingZero.slice(0, -1) : withLeadingZero;
};

export const intentFor = ({
  choice,
  wallet,
  contest,
  votesBefore,
  now,
}: {
  choice: VoteChoice;
  wallet: Address;
  contest: ContestKey;
  votesBefore: bigint | null;
  now: number;
}): VoteIntent => ({
  ...choice,
  amountNative: normalizedAmount(choice.amountNative),
  wallet: wallet.toLowerCase() as Address,
  contest: contestKeyOf(contest),
  votesBefore: votesBefore === null ? null : votesBefore.toString(),
  sentTxHash: null,
  sendingAt: null,
  createdAt: now,
  savedAt: now,
});

const isSameContest = (left: ContestKey, right: ContestKey) =>
  left.chain === right.chain.toLowerCase() && left.address === right.address.toLowerCase();

export const isIntentForWallet = (intent: VoteIntent, wallet: XClaimWallet) =>
  wallet.kind === "embedded" && wallet.address.toLowerCase() === intent.wallet;

export const matchIntent = (
  intent: VoteIntent | null,
  at: { wallet: XClaimWallet; contest: ContestKey; now: number },
): VoteIntent | null => {
  if (!intent || !isIntentForWallet(intent, at.wallet) || !isSameContest(intent.contest, at.contest)) return null;
  return at.now - intent.savedAt <= INTENT_TTL_MS ? intent : null;
};

export const isClaimForIntent = (claim: Pick<XClaimRecord, "createdAt">, intent: VoteIntent) =>
  claim.createdAt.getTime() >= intent.createdAt - CLAIM_CLOCK_SKEW_MS;

export const intentPath = (intent: Pick<VoteIntent, "contest">) =>
  `/contest/${intent.contest.chain}/${intent.contest.address}`;

export const ownsLanding = (intent: VoteIntent | null, pathname: string) =>
  intent !== null && pathname.toLowerCase().replace(/\/+$/, "") === intentPath(intent);
