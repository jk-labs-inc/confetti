import useCastVotes from "@hooks/useCastVotes";
import { Charge } from "@hooks/useDeployContest/types";
import useContestConfigStore from "@hooks/useContestConfig/store";
import useProposalIdStore from "@hooks/useProposalId/store";
import { useProposalVoters } from "@hooks/useProposalVoters";
import useProposalVotes from "@hooks/useProposalVotes";
import { useCallback } from "react";
import { useShallow } from "zustand/shallow";

const REFETCH_DELAY_MS = 1000;

interface UseVotingActionsParams {
  charge: Charge;
  votesClose: Date;
}

export const useVotingActions = ({ charge, votesClose }: UseVotingActionsParams) => {
  const contestConfig = useContestConfigStore(useShallow(state => state.contestConfig));
  const proposalId = useProposalIdStore(useShallow(state => state.proposalId));
  const { castVotes, isLoading } = useCastVotes({ charge, votesClose });
  const { refetch: refetchProposalVotes } = useProposalVotes({
    contestAddress: contestConfig.address,
    proposalId: proposalId,
    chainId: contestConfig.chainId,
    abi: contestConfig.abi,
    version: contestConfig.version,
  });
  const { refetch: refetchProposalVoters } = useProposalVoters(
    contestConfig.address,
    proposalId,
    contestConfig.chainId,
  );

  const castVotesAndRefetch = useCallback(
    async (amount: number) => {
      await castVotes(amount);
      await new Promise(resolve => setTimeout(resolve, REFETCH_DELAY_MS));
      refetchProposalVotes();
      refetchProposalVoters();
    },
    [castVotes, refetchProposalVotes, refetchProposalVoters],
  );

  return {
    castVotes: castVotesAndRefetch,
    isLoading,
  };
};
