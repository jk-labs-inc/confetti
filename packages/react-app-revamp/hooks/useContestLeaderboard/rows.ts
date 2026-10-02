import { isSameAddress } from "@helpers/isSameAddress";
import { calculateProfitPercentage } from "@helpers/percentages";
import { ContestVoteLedger, VoterEntryTally } from "@hooks/useContestVoteLedger/types";
import { formatEther } from "viem";
import { estimateVoterEarning, nativeToWei, pickMainEntryId } from "./earnings";
import {
  EarningsContext,
  EntryRanking,
  LeaderboardMainEntry,
  LeaderboardPnl,
  LeaderboardRow,
  RankableRow,
  RowDraft,
  VerifiedVoterStats,
  VerifiedVoterStatsMap,
} from "./types";

interface BuildLeaderboardRowsParams {
  ledger: ContestVoteLedger | null;
  entryRanking: EntryRanking;
  entryVotesById: Map<string, number>;
  earnings: EarningsContext | null;
  viewerAddress: string | undefined;
}

interface MergeVerifiedRowsParams extends BuildLeaderboardRowsParams {
  rows: RankableRow[];
  verified: VerifiedVoterStatsMap;
}

const NO_PNL_SORT_VALUE = Number.NEGATIVE_INFINITY;

const pnlSortValue = (row: Pick<LeaderboardRow, "pnl">): number => row.pnl?.percentage ?? NO_PNL_SORT_VALUE;

const compareByPayout = (a: RankableRow, b: RankableRow): number =>
  b.earningNative - a.earningNative || pnlSortValue(b) - pnlSortValue(a) || a.address.localeCompare(b.address);

const compareByMultiple = (a: LeaderboardRow, b: LeaderboardRow): number =>
  pnlSortValue(b) - pnlSortValue(a) || b.earningNative - a.earningNative || a.rank - b.rank;

const buildMainEntry = (
  entry: VoterEntryTally | undefined,
  votes: number | null,
  ledger: ContestVoteLedger,
  entryRanking: EntryRanking,
  entryVotesById: Map<string, number>,
): LeaderboardMainEntry | null => {
  if (!entry) return null;
  const entryTotalVotes =
    entryVotesById.get(entry.proposalId) ?? ledger.byEntry.get(entry.proposalId)?.ledgerVotes ?? 0;
  return {
    proposalId: entry.proposalId,
    votes: votes ?? entry.votes,
    entryTotalVotes,
    entryRank: entryRanking.byId.get(entry.proposalId)?.rank ?? 0,
  };
};

const computePnl = (earningWei: bigint, spentWei: bigint): LeaderboardPnl | null =>
  spentWei > 0n ? { percentage: calculateProfitPercentage(earningWei, spentWei) } : null;

const finalizeRow = (draft: RowDraft, earnings: EarningsContext | null): RankableRow => ({
  address: draft.address,
  isOnBoard: earnings !== null && draft.earningNative > 0,
  isViewer: draft.isViewer,
  mainEntry: draft.mainEntry,
  earningNative: earnings ? draft.earningNative : 0,
  spentNative: draft.spentNative,
  pnl: earnings ? computePnl(draft.earningWei, draft.spentWei) : null,
});

export function buildLeaderboardRows({
  ledger,
  entryRanking,
  entryVotesById,
  earnings,
  viewerAddress,
}: BuildLeaderboardRowsParams): RankableRow[] {
  if (!ledger) return [];

  const rows: RankableRow[] = [];
  for (const voter of ledger.byVoter.values()) {
    const earningNative = earnings
      ? estimateVoterEarning(voter.entries.values(), entryRanking, entryVotesById, earnings)
      : 0;
    rows.push(
      finalizeRow(
        {
          address: voter.address,
          isViewer: isSameAddress(voter.address, viewerAddress),
          mainEntry: buildMainEntry(
            voter.entries.get(pickMainEntryId(voter, entryRanking, entryVotesById, earnings)),
            null,
            ledger,
            entryRanking,
            entryVotesById,
          ),
          earningNative,
          earningWei: nativeToWei(earningNative),
          spentNative: voter.totalSpent,
          spentWei: nativeToWei(voter.totalSpent),
        },
        earnings,
      ),
    );
  }

  return rows;
}

const overlayVerified = (
  row: RankableRow,
  stats: VerifiedVoterStats,
  ledger: ContestVoteLedger,
  entryRanking: EntryRanking,
  entryVotesById: Map<string, number>,
  earnings: EarningsContext | null,
): RankableRow => {
  const voterEntries = ledger.byVoter.get(row.address)?.entries;
  const mainEntryTally = row.mainEntry ? voterEntries?.get(row.mainEntry.proposalId) : undefined;
  const verifiedVotes = stats.mainEntryId === row.mainEntry?.proposalId ? stats.votesOnMainEntry : null;
  const spentWei = stats.spentWei ?? nativeToWei(row.spentNative);

  return finalizeRow(
    {
      address: row.address,
      isViewer: row.isViewer,
      mainEntry: buildMainEntry(mainEntryTally, verifiedVotes, ledger, entryRanking, entryVotesById),
      earningNative: Number(formatEther(stats.earningWei)),
      earningWei: stats.earningWei,
      spentNative: stats.spentWei !== null ? Number(formatEther(stats.spentWei)) : row.spentNative,
      spentWei,
    },
    earnings,
  );
};

const synthesizeViewerRow = (stats: VerifiedVoterStats, earnings: EarningsContext | null): RankableRow =>
  finalizeRow(
    {
      address: stats.address,
      isViewer: true,
      mainEntry: null,
      earningNative: Number(formatEther(stats.earningWei)),
      earningWei: stats.earningWei,
      spentNative: Number(formatEther(stats.spentWei ?? 0n)),
      spentWei: stats.spentWei ?? 0n,
    },
    earnings,
  );

export function mergeVerifiedRows({
  rows,
  verified,
  ledger,
  entryRanking,
  entryVotesById,
  earnings,
  viewerAddress,
}: MergeVerifiedRowsParams): RankableRow[] {
  if (!ledger || verified.size === 0) return rows;

  const merged: RankableRow[] = rows.map(row => {
    const stats = verified.get(row.address);
    return stats?.isVerified ? overlayVerified(row, stats, ledger, entryRanking, entryVotesById, earnings) : row;
  });

  const viewerStats = viewerAddress ? verified.get(viewerAddress.toLowerCase()) : undefined;
  const viewerHasRow = rows.some(row => isSameAddress(row.address, viewerAddress));
  const viewerHasActivity = !!viewerStats && (viewerStats.earningWei > 0n || (viewerStats.spentWei ?? 0n) > 0n);
  if (viewerStats?.isVerified && !viewerHasRow && viewerHasActivity) {
    merged.push(synthesizeViewerRow(viewerStats, earnings));
  }

  return merged;
}

export const sortAndRankRows = (rows: RankableRow[]): LeaderboardRow[] =>
  [...rows].sort(compareByPayout).map((row, index) => ({ ...row, rank: index + 1 }));

export const rankRowsByMultiple = (rows: LeaderboardRow[]): LeaderboardRow[] =>
  [...rows].sort(compareByMultiple).map((row, index) => ({ ...row, rank: index + 1 }));
