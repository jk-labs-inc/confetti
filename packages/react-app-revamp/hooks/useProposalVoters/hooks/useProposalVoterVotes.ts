import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import { useInfiniteQuery } from "@tanstack/react-query";
import { readContracts } from "@wagmi/core";
import { useMemo } from "react";
import { formatEther } from "viem";
import { VOTERS_GC_TIME, VOTERS_STALE_TIME, proposalVoterVotesQueryKey } from "../constants";

interface VoterWithVotes {
  address: string;
  votes: bigint | [bigint, bigint];
  formattedVotes: number;
}

interface UseProposalVoterVotesProps {
  contractAddress: string;
  proposalId: string;
  chainId: number;
  abi: any;
  addresses: string[];
  pageSize: number;
  hasDownvotes: boolean;
}

export const useProposalVoterVotes = ({
  contractAddress,
  proposalId,
  chainId,
  abi,
  addresses,
  pageSize,
  hasDownvotes,
}: UseProposalVoterVotesProps) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: [...proposalVoterVotesQueryKey(contractAddress, chainId, proposalId), hasDownvotes],
    initialPageParam: 0,
    queryFn: async ({ pageParam }): Promise<VoterWithVotes[]> => {
      const start = pageParam * pageSize;
      const end = Math.min(start + pageSize, addresses.length);
      const addressesPage = addresses.slice(start, end);

      if (!addressesPage.length) return [];

      const contracts = addressesPage.map(address => ({
        address: contractAddress as `0x${string}`,
        abi,
        chainId,
        functionName: "proposalAddressVotes",
        args: [proposalId, address],
      }));

      const results = await readContracts(getWagmiConfig(), { contracts });

      return addressesPage.map((address, index) => {
        const voteData = results[index]?.result as bigint | [bigint, bigint] | undefined;

        if (!voteData) {
          return {
            address,
            votes: hasDownvotes ? [BigInt(0), BigInt(0)] : BigInt(0),
            formattedVotes: 0,
          };
        }

        // Calculate net votes
        const netVotes = hasDownvotes && Array.isArray(voteData) ? voteData[0] - voteData[1] : (voteData as bigint);

        return {
          address,
          votes: voteData,
          formattedVotes: Number(formatEther(netVotes)),
        };
      });
    },
    getNextPageParam: (_lastPage, allPages, lastPageParam) => {
      const loadedCount = allPages.reduce((count, page) => count + page.length, 0);
      return loadedCount < addresses.length ? lastPageParam + 1 : undefined;
    },
    enabled: !!contractAddress && !!proposalId && !!abi && addresses.length > 0,
    staleTime: VOTERS_STALE_TIME,
    gcTime: VOTERS_GC_TIME,
  });

  const voters = useMemo<VoterWithVotes[]>(() => data?.pages.flat() ?? [], [data]);

  return {
    voters,
    fetchNextPage,
    hasNextPage: !!hasNextPage,
    isFetchingNextPage,
    isLoading,
  };
};
