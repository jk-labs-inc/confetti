import { isSupabaseConfigured } from "@helpers/database";
import { queryOptions } from "@tanstack/react-query";
import { fetchFeaturedContestRows, processContestData } from "lib/contests";
import { fetchContestDetails, fetchContestPool, withoutRewards, withRewards } from "lib/contests/contracts";
import { BaseContestData, ContestWithTotalRewards, ProcessedContest } from "lib/contests/types";
import { ContestPoolRead } from "lib/rewards/types";
import { featuredContestDetailsQueryKey, featuredContestRewardsQueryKey } from "./keys";
import { FeaturedContestEntry, FeaturedSnapshot } from "./types";

const SNAPSHOT_STALE_MS = 60_000;

async function fetchUnreadEntries(): Promise<FeaturedContestEntry[]> {
  const rows = await fetchFeaturedContestRows();
  return rows.map(row => ({ row, details: null, pool: { status: "unread" } }));
}

function snapshotPool({ row, pool }: FeaturedContestEntry): ContestWithTotalRewards | undefined {
  switch (pool.status) {
    case "none":
      return withoutRewards(row);
    case "read":
      return withRewards(row, pool.totals);
    case "unread":
      return undefined;
    default: {
      const _exhaustive: never = pool;
      return _exhaustive;
    }
  }
}

async function fetchFeaturedPool(row: BaseContestData, isPoolOnScreen: boolean): Promise<ContestWithTotalRewards> {
  let pool: ContestPoolRead;
  try {
    pool = await fetchContestPool(row);
  } catch (error) {
    if (isPoolOnScreen) throw error;
    console.error(`Error fetching rewards for contest ${row.address}:`, error);
    return withoutRewards(row);
  }

  switch (pool.status) {
    case "none":
      return withoutRewards(row);
    case "unverified":
      if (isPoolOnScreen) throw new Error(`rewards module unverified for contest ${row.address}`);
      return withoutRewards(row);
    case "read":
      if (!pool.isComplete && isPoolOnScreen) throw new Error(`incomplete pool read for contest ${row.address}`);
      return withRewards(row, pool.totals);
    default: {
      const _exhaustive: never = pool;
      return _exhaustive;
    }
  }
}

export const featuredEntriesWithoutSnapshotQuery = (snapshot: FeaturedSnapshot | null) =>
  queryOptions({
    queryKey: ["featuredContestEntries"],
    queryFn: fetchUnreadEntries,
    enabled: snapshot === null && Boolean(isSupabaseConfigured),
    refetchOnWindowFocus: false,
  });

export const featuredContestQuery = ({ row, details }: FeaturedContestEntry, fetchedAt: number | undefined) =>
  queryOptions({
    queryKey: featuredContestDetailsQueryKey(row),
    queryFn: async ({ client, queryKey }): Promise<ProcessedContest> => {
      const isContestOnScreen = client.getQueryData(queryKey) !== undefined;
      return isContestOnScreen ? { ...row, ...(await fetchContestDetails(row)) } : processContestData(row);
    },
    initialData: details ? { ...row, ...details } : undefined,
    initialDataUpdatedAt: fetchedAt,
    staleTime: SNAPSHOT_STALE_MS,
    refetchOnWindowFocus: false,
  });

export const featuredPoolQuery = (entry: FeaturedContestEntry, fetchedAt: number | undefined) =>
  queryOptions({
    queryKey: featuredContestRewardsQueryKey(entry.row),
    queryFn: ({ client, queryKey }) => {
      const isPoolOnScreen = client.getQueryData<ContestWithTotalRewards>(queryKey)?.hasRewards === true;
      return fetchFeaturedPool(entry.row, isPoolOnScreen);
    },
    initialData: snapshotPool(entry),
    initialDataUpdatedAt: fetchedAt,
    staleTime: SNAPSHOT_STALE_MS,
    refetchOnWindowFocus: false,
  });
