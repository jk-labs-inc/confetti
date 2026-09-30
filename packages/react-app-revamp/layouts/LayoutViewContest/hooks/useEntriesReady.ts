import { useContestStore } from "@hooks/useContest/store";
import { useProposalStore } from "@hooks/useProposal/store";
import { useShallow } from "zustand/shallow";

export const useEntriesReady = (): boolean => {
  const { isContestLoading, isContestSuccess } = useContestStore(
    useShallow(state => ({ isContestLoading: state.isLoading, isContestSuccess: state.isSuccess })),
  );
  const { isListProposalsLoading, isListProposalsSuccess } = useProposalStore(
    useShallow(state => ({
      isListProposalsLoading: state.isListProposalsLoading,
      isListProposalsSuccess: state.isListProposalsSuccess,
    })),
  );

  return !isContestLoading && !isListProposalsLoading && isContestSuccess && isListProposalsSuccess;
};
