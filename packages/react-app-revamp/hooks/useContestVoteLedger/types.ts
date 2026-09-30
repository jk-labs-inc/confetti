import type { ContestVoteEvent } from "lib/analytics/participants/getContestVoteEvents";

export type { ContestVoteEvent };
export type { ContestVoteLedgerData } from "lib/analytics/participants/getContestVoteLedger";

export interface VoterEntryTally {
  proposalId: string;
  votes: number;
  spent: number;
  castCount: number;
  lastCastAt: number;
}

export interface VoterTally {
  address: string;
  totalVotes: number;
  totalSpent: number;
  lastCastAt: number;
  entries: Map<string, VoterEntryTally>;
  highestVotedEntryId: string;
}

export type EntryVoterTally = VoterEntryTally & { address: string };

export interface EntryTally {
  proposalId: string;
  ledgerVotes: number;
  voterCount: number;
  lastCastAt: number;
  votersByVotesDesc: EntryVoterTally[];
}

export interface ContestVoteLedger {
  casts: ContestVoteEvent[];
  byVoter: Map<string, VoterTally>;
  byEntry: Map<string, EntryTally>;
  isTruncated: boolean;
}

export interface UseContestVoteLedgerParams {
  enabled?: boolean;
}

export interface UseContestVoteLedgerResult {
  ledger: ContestVoteLedger | null;
  isLoading: boolean;
  isReconciling: boolean;
  isError: boolean;
}
