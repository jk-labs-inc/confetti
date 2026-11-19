import { useContestStore } from "@hooks/useContest/store";
import { ContestStateEnum, useContestStateStore } from "@hooks/useContestState/store";
import { ContestStatus, useContestStatusStore } from "@hooks/useContestStatus/store";

export const useIsPreVoting = (): boolean => {
  const contestStatus = useContestStatusStore(state => state.contestStatus);
  const isCanceled = useContestStateStore(state => state.contestState === ContestStateEnum.Canceled);
  const votesOpen = useContestStore(state => state.votesOpen);
  const hasPreVotingStatus =
    contestStatus === ContestStatus.ContestOpen || contestStatus === ContestStatus.SubmissionOpen;

  return hasPreVotingStatus && Date.now() < votesOpen.getTime() && !isCanceled;
};
