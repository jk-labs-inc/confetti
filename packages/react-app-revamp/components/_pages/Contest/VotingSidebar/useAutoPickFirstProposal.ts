import { useCastVotesStore } from "@hooks/useCastVotes/store";
import { useProposalStore } from "@hooks/useProposal/store";
import { useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import { useShallow } from "zustand/shallow";

export const useAutoPickFirstProposal = () => {
  const isDesktop = useMediaQuery({ minWidth: 1280 });
  const firstProposalId = useProposalStore(state => state.listProposalsData[0]?.id);
  const { pickedProposal, setPickedProposal } = useCastVotesStore(
    useShallow(state => ({
      pickedProposal: state.pickedProposal,
      setPickedProposal: state.setPickedProposal,
    })),
  );

  useEffect(() => {
    if (!isDesktop) return;
    if (firstProposalId && !pickedProposal) {
      setPickedProposal(firstProposalId);
    }
  }, [isDesktop, firstProposalId, pickedProposal, setPickedProposal]);

  useEffect(() => {
    return () => {
      setPickedProposal(null);
    };
  }, [setPickedProposal]);
};
