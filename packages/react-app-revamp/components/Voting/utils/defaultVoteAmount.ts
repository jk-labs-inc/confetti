import { toFixedString } from "@helpers/formatBalance";

const DEFAULT_VOTE_USD = 5;
const NATIVE_AMOUNT_PRECISION = 4;

export const defaultVoteAmount = ({
  voteCurrencyUsdRate,
  pricePerVoteNative,
}: {
  voteCurrencyUsdRate: number | undefined;
  pricePerVoteNative: string;
}): string | null => {
  const price = Number(pricePerVoteNative);
  if (!Number.isFinite(price) || price <= 0) return null;
  if (!voteCurrencyUsdRate || voteCurrencyUsdRate <= 0) return "";
  const amount = parseFloat((DEFAULT_VOTE_USD / voteCurrencyUsdRate).toPrecision(NATIVE_AMOUNT_PRECISION));
  return amount >= price ? toFixedString(amount) : "";
};
