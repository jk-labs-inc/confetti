import { useContestStore } from "@hooks/useContest/store";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { REFRESH_DEBOUNCE_MS, REFRESH_JITTER_MS } from "@hooks/useContestRealtime/constants";
import { ContestStatus, useContestStatusStore } from "@hooks/useContestStatus/store";
import { ContestVoteLedger } from "@hooks/useContestVoteLedger/types";
import { keepPreviousData, QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";
import { RewardModuleInfo } from "lib/rewards/types";
import { useEffect, useMemo, useRef } from "react";
import { useShallow } from "zustand/shallow";
import { LeaderboardRow, VerifiedVoterStatsMap } from "./types";
import {
  contestLeaderboardVerifyQueryKey,
  fetchVerifiedVoterStats,
  invalidateContestLeaderboard,
  LEADERBOARD_VERIFY_GC_TIME,
  LEADERBOARD_VERIFY_STALE_TIME,
  VERIFY_MIN_INTERVAL_MS,
} from "./verifiedStats";

interface UseVerifiedVoterStatsParams {
  addresses: string[];
  mainEntryByAddress: Map<string, string>;
  rewards: RewardModuleInfo | null;
  enabled: boolean;
}

interface UseVerifyRefreshParams {
  ledger: ContestVoteLedger | null;
  verifyList: string[];
  verifiedMainEntryIds: Set<string>;
  enabled: boolean;
}

type Timer = ReturnType<typeof setTimeout> | null;

const NO_ADDRESSES: string[] = [];

const collectVerifiedStats = (
  queryClient: QueryClient,
  prefix: ReturnType<typeof contestLeaderboardVerifyQueryKey>,
): VerifiedVoterStatsMap => {
  const queries = queryClient
    .getQueryCache()
    .findAll({ queryKey: prefix })
    .sort((a, b) => a.state.dataUpdatedAt - b.state.dataUpdatedAt);

  const union: VerifiedVoterStatsMap = new Map();
  for (const query of queries) {
    const data = query.state.data as VerifiedVoterStatsMap | undefined;
    if (!data) continue;
    for (const [address, stats] of data) union.set(address, stats);
  }
  return union;
};

export function useVerifiedVoterStats({
  addresses,
  mainEntryByAddress,
  rewards,
  enabled,
}: UseVerifiedVoterStatsParams): VerifiedVoterStatsMap {
  const contestConfig = useContestConfigStore(useShallow(state => state.contestConfig));
  const contestAuthorEthereumAddress = useContestStore(useShallow(state => state.contestAuthorEthereumAddress));
  const contestStatus = useContestStatusStore(useShallow(state => state.contestStatus));
  const queryClient = useQueryClient();
  const prefix = useMemo(
    () => contestLeaderboardVerifyQueryKey(contestConfig.address ?? "", contestConfig.chainId),
    [contestConfig.address, contestConfig.chainId],
  );
  const rewardsModuleAddress = (rewards?.contractAddress ?? "").toLowerCase();
  const creatorKey = contestAuthorEthereumAddress.toLowerCase();
  const mainEntriesKey = addresses.map(address => `${address}:${mainEntryByAddress.get(address) ?? ""}`).join(",");

  const { data } = useQuery({
    queryKey: [...prefix, rewardsModuleAddress, contestConfig.version, creatorKey, contestStatus, mainEntriesKey],
    queryFn: () => {
      if (!rewards) throw new Error("leaderboard verification: rewards module not ready");
      return fetchVerifiedVoterStats({
        addresses,
        mainEntryByAddress,
        contest: {
          address: contestConfig.address,
          abi: contestConfig.abi,
          chainId: contestConfig.chainId,
          version: contestConfig.version,
        },
        rewardsModule: {
          address: rewards.contractAddress as `0x${string}`,
          abi: rewards.abi,
          payees: rewards.payees,
        },
        creatorAddress: contestAuthorEthereumAddress,
        includeReleased: contestStatus === ContestStatus.VotingClosed,
      });
    },
    enabled: enabled && !!rewards && addresses.length > 0 && !!contestConfig.address && !!contestConfig.abi,
    staleTime: LEADERBOARD_VERIFY_STALE_TIME,
    gcTime: LEADERBOARD_VERIFY_GC_TIME,
    placeholderData: keepPreviousData,
  });

  return useMemo(() => collectVerifiedStats(queryClient, prefix), [queryClient, prefix, data]);
}

export function useVerifyRefresh({ ledger, verifyList, verifiedMainEntryIds, enabled }: UseVerifyRefreshParams): void {
  const queryClient = useQueryClient();
  const { address, chainId } = useContestConfigStore(
    useShallow(state => ({ address: state.contestConfig.address, chainId: state.contestConfig.chainId })),
  );

  const latestCast = ledger?.casts.at(-1) ?? null;
  const latestUuid = latestCast?.uuid ?? null;

  const latestCastRef = useRef(latestCast);
  latestCastRef.current = latestCast;
  const verifyListRef = useRef(verifyList);
  verifyListRef.current = verifyList;
  const mainEntryIdsRef = useRef(verifiedMainEntryIds);
  mainEntryIdsRef.current = verifiedMainEntryIds;

  const seenUuidRef = useRef<string | null>(null);
  const debounceRef = useRef<Timer>(null);
  const throttleRef = useRef<Timer>(null);
  const lastInvalidateAtRef = useRef(0);

  useEffect(() => {
    if (latestUuid === null) return;
    if (seenUuidRef.current === null || seenUuidRef.current === latestUuid) {
      seenUuidRef.current = latestUuid;
      return;
    }
    seenUuidRef.current = latestUuid;
    if (!enabled) return;

    const cast = latestCastRef.current;
    if (!cast) return;

    const invalidate = () => {
      lastInvalidateAtRef.current = Date.now();
      void invalidateContestLeaderboard(queryClient, { contestAddress: address, chainId });
    };

    const touchesVisibleRow =
      verifyListRef.current.includes(cast.userAddress.toLowerCase()) || mainEntryIdsRef.current.has(cast.proposalId);

    if (touchesVisibleRow) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(
        () => {
          debounceRef.current = null;
          invalidate();
        },
        REFRESH_DEBOUNCE_MS + Math.floor(Math.random() * REFRESH_JITTER_MS),
      );
      return;
    }

    if (throttleRef.current) return;
    const wait = Math.max(0, VERIFY_MIN_INTERVAL_MS - (Date.now() - lastInvalidateAtRef.current));
    throttleRef.current = setTimeout(() => {
      throttleRef.current = null;
      invalidate();
    }, wait);
  }, [latestUuid, enabled, address, chainId, queryClient]);

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (throttleRef.current) clearTimeout(throttleRef.current);
    },
    [],
  );
}

export const useSyncVerifyAddresses = (
  rows: LeaderboardRow[],
  setVerifyAddresses: (addresses: string[]) => void,
): void => {
  const key = rows.map(row => row.address).join(",");

  useEffect(() => {
    setVerifyAddresses(key ? key.split(",") : NO_ADDRESSES);
    return () => setVerifyAddresses(NO_ADDRESSES);
  }, [key, setVerifyAddresses]);
};
