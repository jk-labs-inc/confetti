import { formatUsd } from "@helpers/formatBalance";
import { TotalRewardsData } from "lib/rewards/types";
import { useMemo } from "react";
import useErc20Rates from "./useErc20Rates";
import useNativeRates from "./useNativeRates";

export interface TokenItem {
  value: string;
  symbol: string;
  tokenAddress?: string;
}

export const toRewardTokenItems = (totalRewards: TotalRewardsData | undefined): TokenItem[] => {
  const items: TokenItem[] = [];
  if (totalRewards?.native && totalRewards.native.value > 0n) {
    items.push({ value: totalRewards.native.formatted, symbol: totalRewards.native.symbol });
  }
  Object.entries(totalRewards?.tokens ?? {}).forEach(([address, token]) => {
    if (token.value > 0n) items.push({ value: token.formatted, symbol: token.symbol, tokenAddress: address });
  });
  return items;
};

/**
 * Combines a single combined USD value across all provided token items.
 * Returns formatted USD string or null if no rates are available, allowing components to fall back to native display.
 */
const useTotalRewardsUsd = (items: TokenItem[], chainName: string): string | null => {
  const { data: nativeRates } = useNativeRates();

  const erc20Addresses = useMemo(() => items.filter(i => i.tokenAddress).map(i => i.tokenAddress!), [items]);

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
