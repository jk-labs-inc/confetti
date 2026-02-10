import { formatBalance, formatUsd } from "@helpers/formatBalance";
import { DisplayCurrency, useCurrencyStore } from "./store";
import useErc20Rates from "./useErc20Rates";
import useNativeRates from "./useNativeRates";

export type DisplayPriceResult = {
  displayValue: string;
  displaySymbol: string;
  secondaryValue: string | null;
  secondarySymbol: string | null;
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

/**
 * Pure function that converts a native crypto value to a display format
 * based on the provided currency preference and rates.
 *
 * Accepts a RAW numeric string (e.g. from `formatUnits`). Formatting for
 * human display (abbreviation, rounding) is applied internally via
 * `formatBalance`, so callers should NOT pre-format with `formatBalance`.
 *
 * Returns both a primary display (based on toggle) and a secondary display
 * (the "other" format) so components can show both simultaneously.
 *
 * Use this in non-hook contexts (e.g. callbacks, SVG render functions).
 * For React components, prefer the `useDisplayPrice` hook instead.
 */
export const convertToDisplayPrice = (
  nativeValue: string,
  nativeCurrencySymbol: string,
  displayCurrency: DisplayCurrency,
  nativeRates: Record<string, number>,
  erc20Rates: Record<string, number> = {},
  tokenAddress?: string,
): DisplayPriceResult => {
  const rate = resolveRate(nativeCurrencySymbol, nativeRates, erc20Rates, tokenAddress);
  const numericValue = parseFloat(nativeValue);
  const hasValidRate = rate !== undefined && !isNaN(numericValue);
  const formattedNative = formatBalance(nativeValue);

  if (displayCurrency === "native") {
    const secondaryUsd = hasValidRate ? formatUsd(numericValue * rate) : null;

    return {
      displayValue: formattedNative,
      displaySymbol: nativeCurrencySymbol,
      secondaryValue: secondaryUsd,
      secondarySymbol: secondaryUsd !== null ? "$" : null,
    };
  }

  // USD mode
  if (!hasValidRate) {
    return {
      displayValue: formattedNative,
      displaySymbol: nativeCurrencySymbol,
      secondaryValue: null,
      secondarySymbol: null,
    };
  }

  const usdValue = numericValue * rate;
  const formattedUsd = formatUsd(usdValue);

  return {
    displayValue: formattedUsd,
    displaySymbol: "$",
    secondaryValue: formattedNative,
    secondarySymbol: nativeCurrencySymbol,
  };
};

/**
 * React hook that returns the display value and symbol for a given native crypto amount,
 * converting to USD if the user has toggled USD mode.
 *
 * Self-contained: fetches native rates via `useNativeRates()` and, when both
 * `tokenAddress` and `chainName` are provided, fetches the ERC-20 rate via
 * `useErc20Rates()`. React Query deduplicates and caches all fetches.
 *
 * Returns both primary and secondary display values so components can render both
 * (e.g. "$6,900.00 | 3.25 ETH").
 *
 * Falls back to native display if no USD rate is available.
 */
const useDisplayPrice = (
  nativeValue: string,
  nativeCurrencySymbol: string,
  tokenAddress?: string,
  chainName?: string,
): DisplayPriceResult => {
  const displayCurrency = useCurrencyStore(state => state.displayCurrency);
  const { data: nativeRates } = useNativeRates();
  const { data: erc20Rates } = useErc20Rates(
    tokenAddress && chainName ? [tokenAddress] : [],
    chainName ?? "",
  );

  return convertToDisplayPrice(
    nativeValue,
    nativeCurrencySymbol,
    displayCurrency,
    nativeRates ?? {},
    erc20Rates ?? {},
    tokenAddress,
  );
};

export default useDisplayPrice;
