import { isSameAddress } from "@helpers/isSameAddress";
import { shareOfTotal } from "@helpers/percentages";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { useProposalVoterAddresses } from "@hooks/useProposalVoters/hooks/useProposalVoterAddresses";
import { useProposalVoterVotes } from "@hooks/useProposalVoters/hooks/useProposalVoterVotes";
import { useWallet } from "@hooks/useWallet";
import { compareVersions } from "compare-versions";
import { DOWNVOTES_REMOVED_VERSION } from "constants/versions";
import { useMemo } from "react";
import { useShallow } from "zustand/shallow";
import { DEFAULT_TOP_VOTERS_COUNT, useEntryVoters } from "./index";
import { EntryVoter, EntryVotersResult, UseVerifiedEntryVotersParams } from "./types";

const UNLEDGERED_VOTERS_READ_LIMIT = 25;
const NO_ADDRESSES: string[] = [];

const compareByVotesDesc = (a: EntryVoter, b: EntryVoter): number =>
  b.votes - a.votes || b.lastCastAt - a.lastCastAt || a.address.localeCompare(b.address);

export function useVerifiedEntryVoters({
  proposalId,
  topCount = DEFAULT_TOP_VOTERS_COUNT,
  enabled = true,
}: UseVerifiedEntryVotersParams): EntryVotersResult {
  const { address, abi, chainId, version } = useContestConfigStore(useShallow(state => state.contestConfig));
  const { userAddress } = useWallet();
  const ledgerVoters = useEntryVoters({ proposalId, topCount });

  const hasDownvotes = version ? compareVersions(version, DOWNVOTES_REMOVED_VERSION) < 0 : false;
  const activeProposalId = enabled ? proposalId : "";

  const { addresses, isLoading: isLoadingAddresses } = useProposalVoterAddresses({
    contractAddress: address,
    proposalId: activeProposalId,
    chainId,
    abi,
  });

  const topAddresses = useMemo(() => {
    const unledgeredAddresses = addresses
      .map(voterAddress => voterAddress.toLowerCase())
      .filter(voterAddress => !ledgerVoters.ledgerAddresses.has(voterAddress))
      .slice(0, UNLEDGERED_VOTERS_READ_LIMIT);
    const candidates = new Set([...ledgerVoters.topVoters.map(voter => voter.address), ...unledgeredAddresses]);
    return Array.from(candidates).sort();
  }, [addresses, ledgerVoters.ledgerAddresses, ledgerVoters.topVoters]);

  const { voters, isLoading: isLoadingVotes } = useProposalVoterVotes({
    contractAddress: address,
    proposalId: activeProposalId,
    chainId,
    abi,
    addresses: isLoadingAddresses ? NO_ADDRESSES : topAddresses,
    pageSize: Math.max(topAddresses.length, 1),
    hasDownvotes,
  });

  return useMemo(() => {
    const denominator = ledgerVoters.entryTotalVotes;
    const ledgerTopByAddress = new Map(ledgerVoters.topVoters.map(voter => [voter.address, voter]));
    const verifiedVotesByAddress = new Map(
      voters.filter(voter => voter.isRead).map(voter => [voter.address.toLowerCase(), voter.formattedVotes]),
    );

    const verifiedTop = voters
      .flatMap<EntryVoter>(voter => {
        const voterAddress = voter.address.toLowerCase();
        const ledgerVoter = ledgerTopByAddress.get(voterAddress);
        if (!voter.isRead) return ledgerVoter ? [ledgerVoter] : [];
        return [
          {
            address: voterAddress,
            votes: voter.formattedVotes,
            shareOfEntry: shareOfTotal(voter.formattedVotes, denominator),
            lastCastAt: ledgerVoter?.lastCastAt ?? 0,
            isVerified: true,
            isViewer: isSameAddress(voterAddress, userAddress),
          },
        ];
      })
      .sort(compareByVotesDesc)
      .slice(0, topCount);

    const recentVoters = ledgerVoters.recentVoters.map(voter => {
      const verifiedVotes = verifiedVotesByAddress.get(voter.address);
      return verifiedVotes === undefined
        ? voter
        : { ...voter, votes: verifiedVotes, shareOfEntry: shareOfTotal(verifiedVotes, denominator), isVerified: true };
    });

    return {
      voterCount: addresses.length > 0 ? addresses.length : ledgerVoters.voterCount,
      entryTotalVotes: denominator,
      topVoters: verifiedTop.length > 0 ? verifiedTop : ledgerVoters.topVoters,
      recentVoters,
      isLoading: ledgerVoters.isLoading || isLoadingAddresses || isLoadingVotes,
    };
  }, [ledgerVoters, voters, addresses.length, userAddress, topCount, isLoadingAddresses, isLoadingVotes]);
}

export default useVerifiedEntryVoters;
