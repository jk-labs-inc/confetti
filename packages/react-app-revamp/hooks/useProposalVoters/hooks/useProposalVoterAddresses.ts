import { useReadContract } from "wagmi";
import { VOTERS_GC_TIME, VOTERS_STALE_TIME } from "../constants";

interface UseProposalVoterAddressesProps {
  contractAddress: string;
  proposalId: string;
  chainId: number;
  abi: any;
}

export const useProposalVoterAddresses = ({
  contractAddress,
  proposalId,
  chainId,
  abi,
}: UseProposalVoterAddressesProps) => {
  const {
    data: addresses,
    isLoading,
    error,
    refetch,
  } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi,
    chainId,
    functionName: "proposalAddressesHaveVoted",
    args: [proposalId],
    query: {
      enabled: !!contractAddress && !!proposalId && !!abi,

      staleTime: VOTERS_STALE_TIME,
      gcTime: VOTERS_GC_TIME,
    },
  }) as {
    data: string[] | undefined;
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<any>;
  };

  return {
    addresses: addresses || [],
    totalCount: addresses?.length || 0,
    isLoading,
    error,
    refetch,
  };
};
