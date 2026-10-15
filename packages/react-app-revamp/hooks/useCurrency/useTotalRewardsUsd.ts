import { formatUsd } from "@helpers/formatBalance";
import { UseQueryResult, useQueries } from "@tanstack/react-query";
import { ContestWithTotalRewards } from "lib/contests/types";
import { TotalRewardsData } from "lib/rewards/types";
import { useCallback, useMemo } from "react";
import useErc20Rates, { erc20RatesQueryOptions } from "./useErc20Rates";
import useNativeRates from "./useNativeRates";

export interface TokenItem {
  value: string;
  symbol: string;
  tokenAddress?: string;
}

type UsdRates = Record<string, number>;

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

interface SumRewardsUsdArgs {
  items: TokenItem[];
  nativeRates: UsdRates | undefined;
  erc20Rates: UsdRates | undefined;
}

const sumRewardsUsd = ({ items, nativeRates, erc20Rates }: SumRewardsUsdArgs): number | null => {
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

  return hasAnyRate ? total : null;
};

const toErc20Addresses = (items: TokenItem[]): string[] =>
  items.flatMap(item => (item.tokenAddress ? [item.tokenAddress] : []));

const useTotalRewardsUsd = (items: TokenItem[], chainName: string): string | null => {
  const { data: nativeRates } = useNativeRates();

  const erc20Addresses = useMemo(() => toErc20Addresses(items), [items]);

  const { data: erc20Rates } = useErc20Rates(erc20Addresses, chainName);

  const total = sumRewardsUsd({ items, nativeRates, erc20Rates });

  return total === null ? null : formatUsd(total);
};

export const useRewardPoolsUsd = (
  pools: Record<string, ContestWithTotalRewards> | undefined,
): Record<string, number> | null => {
  const { data: nativeRates, isLoading: isNativeRatesLoading } = useNativeRates();

  const pricedPools = useMemo(
    () =>
      Object.entries(pools ?? {}).map(([key, pool]) => {
        const items = toRewardTokenItems(pool.rewardsData ?? undefined);
        return { key, chain: pool.chain, items, erc20Addresses: toErc20Addresses(items) };
      }),
    [pools],
  );

  const combine = useCallback(
    (erc20Results: UseQueryResult<UsdRates>[]) => {
      if (!pools || isNativeRatesLoading || erc20Results.some(result => result.isLoading)) return null;

      return Object.fromEntries(
        pricedPools.map((pool, index) => [
          pool.key,
          sumRewardsUsd({ items: pool.items, nativeRates, erc20Rates: erc20Results[index]?.data }) ?? 0,
        ]),
      );
    },
    [pools, pricedPools, nativeRates, isNativeRatesLoading],
  );

  return useQueries({
    queries: pricedPools.map(pool => erc20RatesQueryOptions(pool.erc20Addresses, pool.chain)),
    combine,
  });
};

export default useTotalRewardsUsd;
