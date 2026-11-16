import { useContestStore } from "@hooks/useContest/store";
import { ContestStateEnum, useContestStateStore } from "@hooks/useContestState/store";
import { ContestStatus, useContestStatusStore } from "@hooks/useContestStatus/store";
import { useMediaQuery } from "react-responsive";

const PRE_VOTE_SPLIT_MIN_WIDTH_PX = 1024;

export const useIsPreVoteSplit = (): boolean => {
  const contestStatus = useContestStatusStore(state => state.contestStatus);
  const isCanceled = useContestStateStore(state => state.contestState === ContestStateEnum.Canceled);
  const votesOpen = useContestStore(state => state.votesOpen);
  const hasRoomForSplit = useMediaQuery({ minWidth: PRE_VOTE_SPLIT_MIN_WIDTH_PX });
  const hasPreVotingStatus =
    contestStatus === ContestStatus.ContestOpen || contestStatus === ContestStatus.SubmissionOpen;
  const isBeforeVoting = hasPreVotingStatus && Date.now() < votesOpen.getTime();

  return hasRoomForSplit && isBeforeVoting && !isCanceled;
};
