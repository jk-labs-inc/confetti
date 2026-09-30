import { isSameAddress } from "@helpers/isSameAddress";
import { shareOfTotal } from "@helpers/percentages";
import useContestVoteLedger from "@hooks/useContestVoteLedger";
import { EntryVoterTally } from "@hooks/useContestVoteLedger/types";
import { useProposalStore } from "@hooks/useProposal/store";
import { useWallet } from "@hooks/useWallet";
import { useMemo } from "react";
import { EntryVoter, LedgerEntryVoters, UseEntryVotersParams } from "./types";

export type { EntryVoter, EntryVotersResult, UseEntryVotersParams } from "./types";

export const DEFAULT_TOP_VOTERS_COUNT = 3;

const EMPTY_VOTERS: EntryVoter[] = [];
const EMPTY_ADDRESSES = new Set<string>();

const compareByLastCastDesc = (a: EntryVoterTally, b: EntryVoterTally): number =>
  b.lastCastAt - a.lastCastAt || b.votes - a.votes || a.address.localeCompare(b.address);

export function useEntryVoters({
  proposalId,
  topCount = DEFAULT_TOP_VOTERS_COUNT,
}: UseEntryVotersParams): LedgerEntryVoters {
  const { ledger, isLoading } = useContestVoteLedger();
  const entryTotalVotes = useProposalStore(
    state => state.initialMappedProposalIds.find(entry => entry.id === proposalId)?.votes,
  );
  const { userAddress } = useWallet();

  return useMemo(() => {
    const tally = ledger?.byEntry.get(proposalId);
    if (!tally) {
      return {
        voterCount: 0,
        entryTotalVotes: 0,
        topVoters: EMPTY_VOTERS,
        recentVoters: EMPTY_VOTERS,
        ledgerAddresses: EMPTY_ADDRESSES,
        isLoading,
      };
    }

    const denominator = entryTotalVotes && entryTotalVotes > 0 ? entryTotalVotes : tally.ledgerVotes;
    const toEntryVoter = (voter: EntryVoterTally): EntryVoter => ({
      address: voter.address,
      votes: voter.votes,
      shareOfEntry: shareOfTotal(voter.votes, denominator),
      lastCastAt: voter.lastCastAt,
      isVerified: false,
      isViewer: isSameAddress(voter.address, userAddress),
    });

    return {
      voterCount: tally.voterCount,
      entryTotalVotes: denominator,
      topVoters: tally.votersByVotesDesc.slice(0, topCount).map(toEntryVoter),
      recentVoters: [...tally.votersByVotesDesc].sort(compareByLastCastDesc).slice(0, topCount).map(toEntryVoter),
      ledgerAddresses: new Set(tally.votersByVotesDesc.map(voter => voter.address)),
      isLoading,
    };
  }, [ledger, proposalId, entryTotalVotes, userAddress, topCount, isLoading]);
}

export default useEntryVoters;
