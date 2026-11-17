import { MOBILE_MAX_WIDTH_PX } from "@helpers/isMobileViewport";
import { useMediaQuery } from "react-responsive";
import { useIsPreVoting } from "./useIsPreVoting";

export const useIsPreVotePhone = (): boolean => {
  const isPreVoting = useIsPreVoting();
  const isPhone = useMediaQuery({ maxWidth: MOBILE_MAX_WIDTH_PX });

  return isPhone && isPreVoting;
};
