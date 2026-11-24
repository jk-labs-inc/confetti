import { rankFeaturedContests } from "@components/_pages/FeaturedContests/ranking";
import { useRewardPoolsUsd } from "@hooks/useCurrency/useTotalRewardsUsd";
import { useQueries, useQuery, UseQueryResult } from "@tanstack/react-query";
import { CONTESTS_FEATURE_COUNT } from "lib/contests/constants";
import { featuredContestKey } from "lib/contests/featured/keys";
import {
  featuredContestQuery,
  featuredEntriesWithoutSnapshotQuery,
  featuredPoolQuery,
} from "lib/contests/featured/queries";
import { FeaturedContestEntry, FeaturedSnapshot } from "lib/contests/featured/types";
import { ContestWithTotalRewards, ProcessedContest } from "lib/contests/types";
import { useMemo, useState } from "react";

const NO_ENTRIES: FeaturedContestEntry[] = [];

const combineContests = (results: UseQueryResult<ProcessedContest>[]) => ({
  contestData: results.flatMap(({ data }) => (data ? [data] : [])),
  unreadCount: results.filter(result => result.isPending).length,
});

const combineContestRewards = (results: UseQueryResult<ContestWithTotalRewards>[]) => ({
  rewardsByKey: Object.fromEntries(
    results.flatMap(({ data }) =>
      data ? [[featuredContestKey({ network_name: data.chain, address: data.contestAddress }), data] as const] : [],
    ),
  ),
  isRewardsFetching: results.some(result => result.isFetching),
  isAwaitingRewards: results.some(result => result.isPending),
});

export function useFeaturedContests(snapshot: FeaturedSnapshot | null) {
  const entriesWithoutSnapshot = useQuery(featuredEntriesWithoutSnapshotQuery(snapshot));

  const entries = snapshot?.contests ?? entriesWithoutSnapshot.data ?? NO_ENTRIES;
  const fetchedAt = snapshot?.fetchedAt;

  const { contestData, unreadCount } = useQueries({
    queries: entries.map(entry => featuredContestQuery(entry, fetchedAt)),
    combine: combineContests,
  });

  const { rewardsByKey, isRewardsFetching, isAwaitingRewards } = useQueries({
    queries: entries.map(entry => featuredPoolQuery(entry, fetchedAt)),
    combine: combineContestRewards,
  });

  const [settledRewardsByKey, setSettledRewardsByKey] = useState<Record<string, ContestWithTotalRewards>>();
  const isRewardsSettled = settledRewardsByKey ? !isRewardsFetching : !isAwaitingRewards;
  if (isRewardsSettled && settledRewardsByKey !== rewardsByKey) setSettledRewardsByKey(rewardsByKey);

  const poolUsdByKey = useRewardPoolsUsd(settledRewardsByKey);

  const contests = useMemo(
    () => rankFeaturedContests({ contests: contestData, rewardsByKey, poolUsdByKey }),
    [contestData, rewardsByKey, poolUsdByKey],
  );

  const isAwaitingEntries = !snapshot && entriesWithoutSnapshot.isPending;

  return {
    status: snapshot ? ("success" as const) : entriesWithoutSnapshot.status,
    contests,
    pendingCount: isAwaitingEntries ? CONTESTS_FEATURE_COUNT : unreadCount,
    isRewardsFetching,
    isRetrying: entriesWithoutSnapshot.isFetching,
    retry: () => entriesWithoutSnapshot.refetch(),
  };
}
