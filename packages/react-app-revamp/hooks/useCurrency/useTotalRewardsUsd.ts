import { formatUsd } from "@helpers/formatBalance";
import { useMemo } from "react";
import useErc20Rates from "./useErc20Rates";
import useNativeRates from "./useNativeRates";

export interface TokenItem {
  value: string;
  symbol: string;
  tokenAddress?: string;
}

/**
 * Computes a single combined USD value across all provided token items.
 *
 * Self-contained: fetches native rates via `useNativeRates()` and ERC-20
 * rates via `useErc20Rates()` for the given chain. React Query deduplicates
 * and caches all fetches (`staleTime: Infinity`).
 *
 * Returns formatted USD string (e.g. "7,400.00") or null if no rates
 * are available, allowing components to fall back to native display.
 */
const useTotalRewardsUsd = (items: TokenItem[], chainName: string): string | null => {
  const { data: nativeRates } = useNativeRates();

  const erc20Addresses = useMemo(
    () => items.filter(i => i.tokenAddress).map(i => i.tokenAddress!),
    [items],
  );

  const { data: erc20Rates } = useErc20Rates(erc20Addresses, chainName);

  let total = 0;
  let hasAnyRate = false;

  for (const item of items) {
    const num = parseFloat(item.value);
    if (isNaN(num) || num === 0) continue;

    const rate = item.tokenAddress
      ? erc20Rates?.[item.tokenAddress.toLowerCase()]
      : nativeRates?.[item.symbol.toLowerCase()];

    if (rate !== undefined) {
      total += num * rate;
      hasAnyRate = true;
    }
  }

  if (!hasAnyRate) return null;

  return formatUsd(total);
};

export default useTotalRewardsUsd;
