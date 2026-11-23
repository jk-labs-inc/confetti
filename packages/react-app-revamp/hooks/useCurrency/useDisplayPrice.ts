import { formatTokenAmountSmart, formatUsd, formatUsdCeil } from "@helpers/formatBalance";
import BigNumber from "bignumber.js";
import { isUsdPegged, VoteCurrency } from "lib/voteCurrency";
import { DisplayCurrency, useCurrencyStore } from "./store";
import useErc20Rates from "./useErc20Rates";
import useNativeRates from "./useNativeRates";

export type DisplayPriceResult = {
  displayValue: string;
  displaySymbol: string;
  secondaryValue: string | null;
  secondarySymbol: string | null;
  isLoading: boolean;
};

export type PriceDisplay = Pick<DisplayPriceResult, "displayValue" | "displaySymbol">;

export type DisplayPriceOptions = {
  ceilingPrecision?: boolean;
  dollarDenominated?: boolean;
};

/**
 * Resolves the USD rate for a token.
 * If `tokenAddress` is provided, looks up in `erc20Rates`.
 * Otherwise falls back to the native `nativeRates` keyed by symbol.
 */
const resolveRate = (
  nativeCurrencySymbol: string,
  nativeRates: Record<string, number>,
  erc20Rates: Record<string, number>,
  tokenAddress?: string,
): number | undefined => {
  if (tokenAddress) {
    return erc20Rates[tokenAddress.toLowerCase()];
  }

  return nativeRates[nativeCurrencySymbol.toLowerCase()];
};

interface DisplayPriceInput {
  value: string;
  symbol: string;
  rate: number | undefined;
  displayCurrency: DisplayCurrency;
  options?: DisplayPriceOptions;
}

interface VoteCurrencyPriceInput extends Omit<DisplayPriceInput, "symbol"> {
  voteCurrency: VoteCurrency | undefined;
}

const formatDisplayPrice = ({
  value,
  symbol,
  rate,
  displayCurrency,
  options = {},
}: DisplayPriceInput): DisplayPriceResult => {
  const numericValue = parseFloat(value);
  const hasValidRate = rate !== undefined && !isNaN(numericValue);
  const nativeRounding = options.ceilingPrecision ? BigNumber.ROUND_CEIL : BigNumber.ROUND_HALF_UP;
  const formatUsdValue = options.ceilingPrecision ? formatUsdCeil : formatUsd;
  const formattedNative = formatTokenAmountSmart(value, rate, nativeRounding);
  const tickerSymbol = "$" + symbol.toUpperCase();

  if (displayCurrency === "native" && !options.dollarDenominated) {
    const secondaryUsd = hasValidRate ? formatUsdValue(numericValue * rate) : null;

    return {
      displayValue: formattedNative,
      displaySymbol: tickerSymbol,
      secondaryValue: secondaryUsd,
      secondarySymbol: secondaryUsd !== null ? "$" : null,
      isLoading: false,
    };
  }

  if (!hasValidRate) {
    return {
      displayValue: formattedNative,
      displaySymbol: tickerSymbol,
      secondaryValue: null,
      secondarySymbol: null,
      isLoading: false,
    };
  }

  const usdValue = numericValue * rate;
  const formattedUsd = formatUsdValue(usdValue);

  return {
    displayValue: formattedUsd,
    displaySymbol: "$",
    secondaryValue: options.dollarDenominated ? null : formattedNative,
    secondarySymbol: options.dollarDenominated ? null : tickerSymbol,
    isLoading: false,
  };
};

export const formatVoteCurrencyPrice = ({
  value,
  voteCurrency,
  rate,
  displayCurrency,
  options,
}: VoteCurrencyPriceInput): DisplayPriceResult =>
  formatDisplayPrice({
    value,
    symbol: voteCurrency?.symbol ?? "",
    rate,
    displayCurrency,
    options: { ...options, dollarDenominated: isUsdPegged(voteCurrency) },
  });

export const convertToDisplayPrice = (
  nativeValue: string,
  nativeCurrencySymbol: string,
  displayCurrency: DisplayCurrency,
  nativeRates: Record<string, number>,
  erc20Rates: Record<string, number> = {},
  tokenAddress?: string,
  options: DisplayPriceOptions = {},
): DisplayPriceResult =>
  formatDisplayPrice({
    value: nativeValue,
    symbol: nativeCurrencySymbol,
    rate: resolveRate(nativeCurrencySymbol, nativeRates, erc20Rates, tokenAddress),
    displayCurrency,
    options,
  });

/**
 * React hook that returns the display value and symbol for a given native crypto amount,
 * converting to USD if the user has toggled USD mode.
 * Returns both primary and secondary display values so components can render both
 * (e.g. "$6,900.00 | 3.25 ETH").
 * Falls back to native display if no USD rate is available.
 */
const useDisplayPrice = (
  nativeValue: string,
  nativeCurrencySymbol: string,
  tokenAddress?: string,
  chainName?: string,
  options: DisplayPriceOptions = {},
): DisplayPriceResult => {
  const displayCurrency = useCurrencyStore(state => state.displayCurrency);
  const { data: nativeRates, isLoading: isNativeRatesLoading } = useNativeRates();
  const { data: erc20Rates, isLoading: isErc20RatesLoading } = useErc20Rates(
    tokenAddress && chainName ? [tokenAddress] : [],
    chainName ?? "",
  );

  const isLoading = displayCurrency === "usd" && (tokenAddress ? isErc20RatesLoading : isNativeRatesLoading);

  const result = convertToDisplayPrice(
    nativeValue,
    nativeCurrencySymbol,
    displayCurrency,
    nativeRates ?? {},
    erc20Rates ?? {},
    tokenAddress,
    options,
  );

  return { ...result, isLoading };
};

export default useDisplayPrice;
