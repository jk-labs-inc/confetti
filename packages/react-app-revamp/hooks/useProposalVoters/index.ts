import useContestConfigStore from "@hooks/useContestConfig/store";
import { compareVersions } from "compare-versions";
import { useMemo } from "react";
import { useShallow } from "zustand/shallow";
import { VOTES_PER_PAGE } from "./constants";
import { useProposalVoterAddresses } from "./hooks/useProposalVoterAddresses";
import { useProposalVoterVotes } from "./hooks/useProposalVoterVotes";

export { VOTES_PER_PAGE };

export const useProposalVoters = (
  contractAddress: string,
  proposalId: string,
  chainId: number,
  pageSize: number = VOTES_PER_PAGE,
) => {
  const { abi, version } = useContestConfigStore(
    useShallow(state => ({
      abi: state.contestConfig.abi,
      version: state.contestConfig.version,
    })),
  );

  const hasDownvotes = version ? compareVersions(version, "5.1") < 0 : false;

  const { addresses, isLoading: isLoadingAddresses } = useProposalVoterAddresses({
    contractAddress,
    proposalId,
    chainId,
    abi,
  });

  const { voters, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading: isLoadingVotes } = useProposalVoterVotes({
    contractAddress,
    proposalId,
    chainId,
    abi,
    addresses,
    pageSize,
    hasDownvotes,
  });

  // Flatten the cached pages into an address -> votes map (preserves voter order).
  const accumulatedVotesData = useMemo(
    () =>
      voters.reduce(
        (acc, { address, formattedVotes }) => {
          acc[address] = formattedVotes;
          return acc;
        },
        {} as Record<string, number>,
      ),
    [voters],
  );

  return {
    accumulatedVotesData,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoading: isLoadingAddresses || isLoadingVotes,
  };
};
