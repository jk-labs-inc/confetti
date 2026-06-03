import { QueryClient } from "@tanstack/react-query";
import { proposalVoterVotesQueryKey } from "./constants";

interface InvalidateProposalVotersParams {
  contractAddress: string;
  chainId: number;
  proposalId: string;
}

/**
 * Refetch a single proposal's voters (its address list + per-voter votes). Used after the user casts a
 * vote and behind the manual refresh button.
 */
export const invalidateProposalVoters = (
  queryClient: QueryClient,
  { contractAddress, chainId, proposalId }: InvalidateProposalVotersParams,
) => {
  if (!contractAddress || !proposalId) return Promise.resolve([]);

  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: proposalVoterVotesQueryKey(contractAddress, chainId, proposalId),
    }),
    queryClient.invalidateQueries({
      queryKey: [
        "readContract",
        { address: contractAddress, functionName: "proposalAddressesHaveVoted", args: [proposalId] },
      ],
    }),
  ]);
};
