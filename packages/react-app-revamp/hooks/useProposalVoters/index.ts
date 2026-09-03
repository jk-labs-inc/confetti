import useContestConfigStore from "@hooks/useContestConfig/store";
import { useWallet } from "@hooks/useWallet";
import { isSameAddress } from "@helpers/isSameAddress";
import { compareVersions } from "compare-versions";
import { useMemo } from "react";
import { useShallow } from "zustand/shallow";
import { VOTES_PER_PAGE } from "./constants";
import { useProposalVoterAddresses } from "./hooks/useProposalVoterAddresses";
import { useProposalVoterVotes } from "./hooks/useProposalVoterVotes";

export { VOTES_PER_PAGE };

const pinAddressFirst = (addresses: string[], pinnedAddress: string | undefined) => {
  const pinnedIndex = addresses.findIndex(address => isSameAddress(address, pinnedAddress));
  if (pinnedIndex <= 0) return addresses;

  return [addresses[pinnedIndex], ...addresses.slice(0, pinnedIndex), ...addresses.slice(pinnedIndex + 1)];
};

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
  const { userAddress } = useWallet();

  const hasDownvotes = version ? compareVersions(version, "5.1") < 0 : false;

  const { addresses, isLoading: isLoadingAddresses } = useProposalVoterAddresses({
    contractAddress,
    proposalId,
    chainId,
    abi,
  });

  const orderedAddresses = useMemo(() => pinAddressFirst(addresses, userAddress), [addresses, userAddress]);

  const { voters, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading: isLoadingVotes } = useProposalVoterVotes({
    contractAddress,
    proposalId,
    chainId,
    abi,
    addresses: orderedAddresses,
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
