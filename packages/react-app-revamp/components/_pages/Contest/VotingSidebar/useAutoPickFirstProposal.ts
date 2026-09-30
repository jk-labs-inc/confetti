import { useCastVotesStore } from "@hooks/useCastVotes/store";
import { useHasVoteRail } from "@hooks/useContestLayoutBand";
import { useProposalStore } from "@hooks/useProposal/store";
import { useEffect } from "react";
import { useShallow } from "zustand/shallow";

export const useAutoPickFirstProposal = () => {
  const hasVoteRail = useHasVoteRail();
  const firstProposalId = useProposalStore(state => state.listProposalsData[0]?.id);
  const { pickedProposal, setPickedProposal } = useCastVotesStore(
    useShallow(state => ({
      pickedProposal: state.pickedProposal,
      setPickedProposal: state.setPickedProposal,
    })),
  );

  useEffect(() => {
    if (!hasVoteRail) return;
    if (firstProposalId && !pickedProposal) {
      setPickedProposal(firstProposalId);
    }
  }, [hasVoteRail, firstProposalId, pickedProposal, setPickedProposal]);

  useEffect(() => {
    return () => {
      setPickedProposal(null);
    };
  }, [setPickedProposal]);
};
