import { parseEther } from "viem";
import { PRICE_SETTLE_PAD_S, PRICE_WINDOW_GUARD_S } from "./constants";
import type { CreditGate, VoteIntent, VoteSize } from "./types";

const CREDIT_MATCH_MARGIN_PERCENT = 5n;

const minOf = (left: bigint, right: bigint) => (left < right ? left : right);

export const chosenWei = (amountNative: string): bigint => {
  if (!amountNative) return 0n;
  try {
    return parseEther(amountNative);
  } catch {
    return 0n;
  }
};

export const ownVoteNative = ({ amountNative, spendableNative }: Pick<VoteIntent, "amountNative" | "spendableNative">) =>
  spendableNative !== null && chosenWei(spendableNative) < chosenWei(amountNative) ? spendableNative : amountNative;

export const sizeClaimVote = ({
  spendableWei,
  chosenWei,
  creditWei,
  priceWei,
}: {
  spendableWei: bigint;
  chosenWei: bigint;
  creditWei: bigint;
  priceWei: bigint;
}): VoteSize => {
  if (priceWei <= 0n) return { votes: 0, reason: "no_price" };
  const spend = minOf(chosenWei + creditWei, spendableWei);
  const votes = spend / priceWei;
  if (votes <= 0n) return { votes: 0, reason: "cannot_afford" };
  return {
    votes: Number(votes),
    valueWei: votes * priceWei,
    wantedMore: chosenWei * 100n > creditWei * (100n + CREDIT_MATCH_MARGIN_PERCENT) && votes < chosenWei / priceWei,
  };
};

export const coversOwnVote = ({
  balanceWei,
  spendableWei,
  chosenWei,
  priceWei,
}: {
  balanceWei: bigint;
  spendableWei: bigint;
  chosenWei: bigint;
  priceWei: bigint;
}): boolean => priceWei > 0n && chosenWei >= priceWei && spendableWei >= priceWei && balanceWei >= chosenWei;

export const buysOneVote = ({ spendableWei, priceWei }: { spendableWei: bigint; priceWei: bigint }): boolean =>
  priceWei > 0n && spendableWei >= priceWei;

const positive = (value: number | undefined): value is number =>
  value !== undefined && Number.isFinite(value) && value > 0;

export const totalWithCredit = ({
  amountNative,
  creditUsd,
  nativeUsdRate,
}: {
  amountNative: string;
  creditUsd: string | null;
  nativeUsdRate: number | undefined;
}): string | null => {
  const amount = Number(amountNative);
  const credit = creditUsd === null ? undefined : Number(creditUsd);
  if (!positive(amount) || !positive(credit) || !positive(nativeUsdRate)) return null;
  return String(amount + credit / nativeUsdRate);
};

export const creditGate = ({
  creditUsd,
  nativeUsdRate,
  pricePerVoteNative,
}: {
  creditUsd: string | null;
  nativeUsdRate: number | undefined;
  pricePerVoteNative: string;
}): CreditGate => {
  const credit = creditUsd === null ? undefined : Number(creditUsd);
  const price = Number(pricePerVoteNative);
  if (!positive(credit) || !positive(nativeUsdRate) || !positive(price)) return "unknown";
  return price * nativeUsdRate <= credit ? "covers" : "too_expensive";
};

export const msUntilPriceSettles = ({
  now,
  votesCloseMs,
  intervalSec,
}: {
  now: number;
  votesCloseMs: number;
  intervalSec: number | undefined;
}): number => {
  if (!intervalSec || intervalSec <= 0) return 0;
  const secondsLeft = Math.floor((votesCloseMs - now) / 1000);
  if (secondsLeft <= 0) return 0;
  const secondsToStep = secondsLeft % intervalSec;
  return secondsToStep < PRICE_WINDOW_GUARD_S ? (secondsToStep + PRICE_SETTLE_PAD_S) * 1000 : 0;
};
