import { useMediaQuery } from "react-responsive";
import { useIsPreVoting } from "./useIsPreVoting";

const PRE_VOTE_SPLIT_MIN_WIDTH_PX = 1024;

export const useIsPreVoteSplit = (): boolean => {
  const isPreVoting = useIsPreVoting();
  const hasRoomForSplit = useMediaQuery({ minWidth: PRE_VOTE_SPLIT_MIN_WIDTH_PX });

  return hasRoomForSplit && isPreVoting;
};
