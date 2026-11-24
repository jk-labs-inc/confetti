import { formatUsd } from "@helpers/formatBalance";
import { UseQueryResult, useQueries } from "@tanstack/react-query";
import { ContestWithTotalRewards } from "lib/contests/types";
import { TotalRewardsData } from "lib/rewards/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

const useRewardRates = (items: TokenItem[], chainName: string) => {
  const { data: nativeRates, isLoading: isNativeRatesLoading } = useNativeRates();
  const erc20Addresses = useMemo(() => toErc20Addresses(items), [items]);
  const { data: erc20Rates, isLoading: isErc20RatesLoading } = useErc20Rates(erc20Addresses, chainName);

  return { nativeRates, erc20Rates, isLoading: isNativeRatesLoading || isErc20RatesLoading };
};

const toFormattedUsd = (total: number | null): string | null =>
  total === null || Number.isNaN(total) ? null : formatUsd(total);

const useTotalRewardsUsd = (items: TokenItem[], chainName: string): string | null => {
  const { nativeRates, erc20Rates } = useRewardRates(items, chainName);

  return toFormattedUsd(sumRewardsUsd({ items, nativeRates, erc20Rates }));
};

const MIN_VISIBLE_INCREASE_USD = 0.001;

interface RewardsIncrease {
  amountUsd: number;
  id: number;
}

interface UseRewardsUsdArgs {
  items: TokenItem[];
  chainName: string;
}

interface RewardsUsd {
  totalUsd: string | null;
  increase: RewardsIncrease | null;
  isRatesLoading: boolean;
}

export const useRewardsUsd = ({ items, chainName }: UseRewardsUsdArgs): RewardsUsd => {
  const { nativeRates, erc20Rates, isLoading } = useRewardRates(items, chainName);
  const highestItemsRef = useRef<TokenItem[] | null>(null);
  const [increase, setIncrease] = useState<RewardsIncrease | null>(null);

  useEffect(() => {
    if (isLoading) return;

    const totalUsd = sumRewardsUsd({ items, nativeRates, erc20Rates });
    if (totalUsd === null || Number.isNaN(totalUsd)) return;

    const highestItems = highestItemsRef.current;
    const highestTotalUsd = highestItems ? sumRewardsUsd({ items: highestItems, nativeRates, erc20Rates }) : null;
    if (highestTotalUsd !== null && totalUsd < highestTotalUsd) return;

    highestItemsRef.current = items;
    if (highestTotalUsd === null) return;

    const amountUsd = totalUsd - highestTotalUsd;
    if (!(amountUsd >= MIN_VISIBLE_INCREASE_USD)) return;

    setIncrease(current => ({ amountUsd, id: (current?.id ?? 0) + 1 }));
  }, [items, nativeRates, erc20Rates, isLoading]);

  return {
    totalUsd: toFormattedUsd(sumRewardsUsd({ items, nativeRates, erc20Rates })),
    increase,
    isRatesLoading: isLoading,
  };
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
