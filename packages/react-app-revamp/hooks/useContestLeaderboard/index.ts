import useContestConfigStore from "@hooks/useContestConfig/store";
import useContestVoteLedger from "@hooks/useContestVoteLedger";
import { useProposalStore } from "@hooks/useProposal/store";
import useRewardsModule from "@hooks/useRewards";
import { useTotalRewards } from "@hooks/useTotalRewards";
import { useWallet } from "@hooks/useWallet";
import { useMemo } from "react";
import { Address } from "viem";
import { useShallow } from "zustand/shallow";
import { hasVoterPayouts, payableRankSet, pickMainEntryId, rankEntries } from "./earnings";
import { buildLeaderboardRows, mergeVerifiedRows, sortAndRankRows } from "./rows";
import { ContestLeaderboard, EarningsContext, UseContestLeaderboardParams } from "./types";
import { useVerifiedVoterStats, useVerifyRefresh } from "./useVerifiedVoterStats";

export type {
  ContestLeaderboard,
  LeaderboardMainEntry,
  LeaderboardPnl,
  LeaderboardRow,
  UseContestLeaderboardParams,
} from "./types";
export { formatMainEntryLine, rankRowsByMultiple } from "./rows";
export { useSyncVerifyAddresses } from "./useVerifiedVoterStats";
export { invalidateContestLeaderboard } from "./verifiedStats";

export const useHasLeaderboard = (): boolean => {
  const { data: rewards } = useRewardsModule();
  return hasVoterPayouts(rewards);
};

const uniqueSortedLowercase = (addresses: Array<string | undefined>): string[] =>
  Array.from(new Set(addresses.filter((address): address is string => !!address).map(a => a.toLowerCase()))).sort();

export function useContestLeaderboard({
  verifyAddresses,
  enabled = true,
}: UseContestLeaderboardParams): ContestLeaderboard {
  const contestConfig = useContestConfigStore(useShallow(state => state.contestConfig));
  const { userAddress } = useWallet();
  const { initialMappedProposalIds, isListProposalsLoading } = useProposalStore(
    useShallow(state => ({
      initialMappedProposalIds: state.initialMappedProposalIds,
      isListProposalsLoading: state.isListProposalsLoading,
    })),
  );
  const {
    ledger,
    isLoading: isLedgerLoading,
    isReconciling,
    isError: isLedgerError,
  } = useContestVoteLedger({ enabled });

  const { data: rewards, isSuccess: isRewardsSuccess, isLoading: isRewardsLoading } = useRewardsModule();
  const earningsReady = isRewardsSuccess && hasVoterPayouts(rewards);
  const { data: totalRewards, isLoading: isPoolLoading } = useTotalRewards({
    rewardsModuleAddress: rewards?.contractAddress as Address | undefined,
    rewardsModuleAbi: rewards?.abi,
    chainId: contestConfig.chainId,
    enabled: earningsReady,
  });
  const poolNative = Number(totalRewards?.native.formatted ?? "0");

  const hasEntryRanking = initialMappedProposalIds.length > 0;
  const isEarningsAvailable = earningsReady && !isPoolLoading && !!totalRewards && hasEntryRanking;

  const entryRanking = useMemo(() => rankEntries(initialMappedProposalIds), [initialMappedProposalIds]);
  const entryVotesById = useMemo(
    () => new Map(initialMappedProposalIds.map(entry => [entry.id, entry.votes])),
    [initialMappedProposalIds],
  );
  const earnings = useMemo<EarningsContext | null>(
    () =>
      isEarningsAvailable && rewards
        ? {
            payees: rewards.payees,
            payeeShares: rewards.payeeShares,
            totalShares: rewards.totalShares,
            poolNative,
            payableRanks: payableRankSet(rewards.payees, entryRanking.firstTiedRank),
          }
        : null,
    [isEarningsAvailable, rewards, poolNative, entryRanking],
  );

  const estimatedRows = useMemo(
    () => buildLeaderboardRows({ ledger, entryRanking, entryVotesById, earnings, viewerAddress: userAddress }),
    [ledger, entryRanking, entryVotesById, earnings, userAddress],
  );

  const verifyKey = uniqueSortedLowercase([...verifyAddresses, userAddress]).join(",");
  const verifyList = useMemo(() => (verifyKey ? verifyKey.split(",") : []), [verifyKey]);
  const mainEntryByAddress = useMemo(() => {
    const map = new Map<string, string>();
    for (const address of verifyList) {
      const voter = ledger?.byVoter.get(address);
      if (voter) map.set(address, pickMainEntryId(voter, entryRanking, entryVotesById, earnings));
    }
    return map;
  }, [verifyList, ledger, entryRanking, entryVotesById, earnings]);

  const verified = useVerifiedVoterStats({
    addresses: verifyList,
    mainEntryByAddress,
    rewards: earningsReady && rewards ? rewards : null,
    enabled: enabled && earningsReady && verifyList.length > 0,
  });

  const rows = useMemo(
    () =>
      sortAndRankRows(
        mergeVerifiedRows({
          rows: estimatedRows,
          verified,
          ledger,
          entryRanking,
          entryVotesById,
          earnings,
          viewerAddress: userAddress,
        }),
      ),
    [estimatedRows, verified, ledger, entryRanking, entryVotesById, earnings, userAddress],
  );

  const isLoading =
    isLedgerLoading || isListProposalsLoading || isRewardsLoading || (earningsReady && isPoolLoading) || isReconciling;

  const viewerRow = useMemo(() => rows.find(row => row.isViewer) ?? null, [rows]);

  const verifiedMainEntryIds = useMemo(() => {
    const ids = new Set<string>();
    for (const stats of verified.values()) {
      if (stats.mainEntryId) ids.add(stats.mainEntryId);
    }
    return ids;
  }, [verified]);

  useVerifyRefresh({ ledger, verifyList, verifiedMainEntryIds, enabled: enabled && earningsReady });

  return useMemo<ContestLeaderboard>(
    () => ({
      rows,
      viewerRow,
      totals: { poolNative },
      isEarningsAvailable,
      isLoading,
      isError: isLedgerError,
    }),
    [rows, viewerRow, poolNative, isEarningsAvailable, isLoading, isLedgerError],
  );
}

export default useContestLeaderboard;
