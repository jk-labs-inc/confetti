import { VoteCurrency } from "./types";

const USD_PEG_RATE = 1;

export const isUsdPegged = (voteCurrency: VoteCurrency | undefined): boolean =>
  voteCurrency?.kind === "token" && voteCurrency.usdPegged;

export const voteCurrencyUsdRate = (
  voteCurrency: VoteCurrency | undefined,
  nativeRates: Record<string, number> | undefined,
): number | undefined => {
  if (!voteCurrency) return undefined;
  return isUsdPegged(voteCurrency) ? USD_PEG_RATE : nativeRates?.[voteCurrency.symbol.toLowerCase()];
};
