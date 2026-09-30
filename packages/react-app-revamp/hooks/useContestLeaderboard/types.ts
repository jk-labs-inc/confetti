export interface EntryRank {
  rank: number;
  votes: number;
  isTied: boolean;
}

export interface EntryRanking {
  byId: Map<string, EntryRank>;
  firstTiedRank: number;
}

export interface LeaderboardMainEntry {
  proposalId: string;
  votes: number;
  entryTotalVotes: number;
  entryRank: number;
}

export interface LeaderboardPnl {
  percentage: number;
}

export interface LeaderboardRow {
  address: string;
  rank: number;
  isOnBoard: boolean;
  isViewer: boolean;
  mainEntry: LeaderboardMainEntry | null;
  earningNative: number;
  spentNative: number;
  pnl: LeaderboardPnl | null;
}

export interface LeaderboardTotals {
  poolNative: number;
}

export interface ContestLeaderboard {
  rows: LeaderboardRow[];
  viewerRow: LeaderboardRow | null;
  totals: LeaderboardTotals;
  isEarningsAvailable: boolean;
  isLoading: boolean;
  isError: boolean;
}

export interface UseContestLeaderboardParams {
  verifyAddresses: string[];
  enabled?: boolean;
}

export interface EarningsContext {
  payees: number[];
  payeeShares: number[];
  totalShares: number;
  poolNative: number;
  payableRanks: Set<number>;
}

export interface VerifiedVoterStats {
  address: string;
  earningWei: bigint;
  spentWei: bigint | null;
  mainEntryId: string | null;
  votesOnMainEntry: number | null;
  isVerified: boolean;
}

export type VerifiedVoterStatsMap = Map<string, VerifiedVoterStats>;

export type RankableRow = Omit<LeaderboardRow, "rank">;

export interface RowDraft {
  address: string;
  isViewer: boolean;
  mainEntry: LeaderboardMainEntry | null;
  earningNative: number;
  earningWei: bigint;
  spentNative: number;
  spentWei: bigint;
}
