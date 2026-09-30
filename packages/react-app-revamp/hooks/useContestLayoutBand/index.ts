import { MOBILE_MAX_WIDTH_PX } from "@helpers/isMobileViewport";
import { useMediaQuery } from "react-responsive";

export enum ContestLayoutBand {
  Mobile = "mobile",
  Tablet = "tablet",
  TwoColumn = "twoColumn",
  Terminal = "terminal",
}

export const CONTEST_VOTE_RAIL_MIN_WIDTH_PX = 1024;
export const CONTEST_TERMINAL_MIN_WIDTH_PX = 1280;
export const CONTEST_WIDE_MIN_WIDTH_PX = 1440;

export const useHasVoteRail = (): boolean => useMediaQuery({ minWidth: CONTEST_VOTE_RAIL_MIN_WIDTH_PX });

export const useContestLayoutBand = (): ContestLayoutBand => {
  const isMobile = useMediaQuery({ maxWidth: MOBILE_MAX_WIDTH_PX });
  const isTerminal = useMediaQuery({ minWidth: CONTEST_TERMINAL_MIN_WIDTH_PX });
  const hasVoteRail = useHasVoteRail();

  if (isMobile) return ContestLayoutBand.Mobile;
  if (isTerminal) return ContestLayoutBand.Terminal;
  if (hasVoteRail) return ContestLayoutBand.TwoColumn;
  return ContestLayoutBand.Tablet;
};

export default useContestLayoutBand;
