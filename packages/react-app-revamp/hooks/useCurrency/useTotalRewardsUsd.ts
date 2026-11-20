import { formatUsd } from "@helpers/formatBalance";
import { UseQueryResult, useQueries } from "@tanstack/react-query";
import { ContestWithTotalRewards } from "lib/contests/types";
import { RewardTokenItem, UsdRates } from "lib/rewards/types";
import { sumRewardsUsd, toRewardTokenItems } from "lib/rewards/valuation";
import { useCallback, useMemo } from "react";
import useErc20Rates, { erc20RatesQueryOptions } from "./useErc20Rates";
import useNativeRates from "./useNativeRates";

const toErc20Addresses = (items: RewardTokenItem[]): string[] =>
  items.flatMap(item => (item.tokenAddress ? [item.tokenAddress] : []));

const useTotalRewardsUsd = (items: RewardTokenItem[], chainName: string): string | null => {
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
