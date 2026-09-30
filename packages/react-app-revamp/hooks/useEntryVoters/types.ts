export interface EntryVoter {
  address: string;
  votes: number;
  shareOfEntry: number;
  lastCastAt: number;
  isVerified: boolean;
  isViewer: boolean;
}

export interface EntryVotersResult {
  voterCount: number;
  entryTotalVotes: number;
  topVoters: EntryVoter[];
  recentVoters: EntryVoter[];
  isLoading: boolean;
}

export interface LedgerEntryVoters extends EntryVotersResult {
  ledgerAddresses: Set<string>;
}

export interface UseEntryVotersParams {
  proposalId: string;
  topCount?: number;
}

export interface UseVerifiedEntryVotersParams extends UseEntryVotersParams {
  enabled?: boolean;
}
