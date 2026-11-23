import { formatUsd } from "@helpers/formatBalance";
import { UseQueryResult, useQueries } from "@tanstack/react-query";
import { ContestWithTotalRewards } from "lib/contests/types";
import { RewardTokenItem, UsdRates } from "lib/rewards/types";
import { sumRewardsUsd, toRewardTokenItems } from "lib/rewards/valuation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useErc20Rates, { erc20RatesQueryOptions } from "./useErc20Rates";
import useNativeRates from "./useNativeRates";

const toErc20Addresses = (items: RewardTokenItem[]): string[] =>
  items.flatMap(item => (item.tokenAddress ? [item.tokenAddress] : []));

const useRewardRates = (items: RewardTokenItem[], chainName: string) => {
  const { data: nativeRates, isLoading: isNativeRatesLoading } = useNativeRates();
  const erc20Addresses = useMemo(() => toErc20Addresses(items), [items]);
  const { data: erc20Rates, isLoading: isErc20RatesLoading } = useErc20Rates(erc20Addresses, chainName);

  return { nativeRates, erc20Rates, isLoading: isNativeRatesLoading || isErc20RatesLoading };
};

const toFormattedUsd = (total: number | null): string | null =>
  total === null || Number.isNaN(total) ? null : formatUsd(total);

const useTotalRewardsUsd = (items: RewardTokenItem[], chainName: string): string | null => {
  const { nativeRates, erc20Rates } = useRewardRates(items, chainName);

  return toFormattedUsd(sumRewardsUsd({ items, nativeRates, erc20Rates }));
};

const MIN_VISIBLE_INCREASE_USD = 0.001;

interface RewardsIncrease {
  amountUsd: number;
  id: number;
}

interface UseRewardsUsdArgs {
  items: RewardTokenItem[];
  chainName: string;
}

interface RewardsUsd {
  totalUsd: string | null;
  increase: RewardsIncrease | null;
}

export const useRewardsUsd = ({ items, chainName }: UseRewardsUsdArgs): RewardsUsd => {
  const { nativeRates, erc20Rates, isLoading } = useRewardRates(items, chainName);
  const highestItemsRef = useRef<RewardTokenItem[] | null>(null);
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

  return { totalUsd: toFormattedUsd(sumRewardsUsd({ items, nativeRates, erc20Rates })), increase };
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
