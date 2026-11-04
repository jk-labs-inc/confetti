import { toFixedString } from "@helpers/formatBalance";

const DEFAULT_VOTE_USD = 5;
const NATIVE_AMOUNT_PRECISION = 4;

export const defaultVoteAmount = ({
  nativeUsdRate,
  pricePerVoteNative,
}: {
  nativeUsdRate: number | undefined;
  pricePerVoteNative: string;
}): string | null => {
  const price = Number(pricePerVoteNative);
  if (!Number.isFinite(price) || price <= 0) return null;
  if (!nativeUsdRate || nativeUsdRate <= 0) return "";
  const amount = parseFloat((DEFAULT_VOTE_USD / nativeUsdRate).toPrecision(NATIVE_AMOUNT_PRECISION));
  return amount >= price ? toFixedString(amount) : "";
};
