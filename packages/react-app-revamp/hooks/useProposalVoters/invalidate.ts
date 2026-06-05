import { QueryClient } from "@tanstack/react-query";
import { proposalVoterVotesQueryKey } from "./constants";

interface InvalidateProposalVotersParams {
  contractAddress: string;
  chainId: number;
  proposalId: string;
}

/**
 * Refetch a single proposal's voters (its address list + per-voter votes). Used after the user casts a
 * vote (useCastVotes) and when a realtime vote.cast event arrives for that proposal (useContestRealtime).
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

/**
 Refetch all proposal voters (all entries' address lists + per-voter votes). Used after the user
 casts a vote (useCastVotes) and when a realtime vote.cast event arrives for that proposal (useContestRealtime).
 */
export const invalidateAllProposalVoters = (queryClient: QueryClient) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: ["proposalVoterVotes"] }),
    queryClient.invalidateQueries({
      predicate: query => {
        const params = query.queryKey[1] as { functionName?: string } | undefined;
        return query.queryKey[0] === "readContract" && params?.functionName === "proposalAddressesHaveVoted";
      },
    }),
  ]);
