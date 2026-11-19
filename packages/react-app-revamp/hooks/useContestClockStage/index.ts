import { formatCompactCountdown } from "@helpers/dates";
import { useContestStore } from "@hooks/useContest/store";
import { ContestStateEnum, useContestStateStore } from "@hooks/useContestState/store";
import { useCountdownTimer } from "@hooks/useTimer";
import moment from "moment";
import { useShallow } from "zustand/shallow";
import { ContestClockStage } from "./types";

const ENDED_DATE_FORMAT = "MMM D";
const MS_PER_SECOND = 1000;

export const useContestClockStage = (): ContestClockStage => {
  const { votesOpen, votesClose } = useContestStore(
    useShallow(state => ({ votesOpen: state.votesOpen, votesClose: state.votesClose })),
  );
  const isCanceled = useContestStateStore(state => state.contestState === ContestStateEnum.Canceled);
  const votingSecondsLeft = useCountdownTimer(votesClose);

  if (isCanceled) return { stage: "canceled" };

  const msUntilVotingOpens = votesOpen.getTime() - Date.now();
  if (msUntilVotingOpens > 0) {
    return { stage: "upcoming", countdown: formatCompactCountdown(Math.ceil(msUntilVotingOpens / MS_PER_SECOND)) };
  }

  if (votingSecondsLeft > 0) return { stage: "live", countdown: formatCompactCountdown(votingSecondsLeft) };

  return { stage: "ended", endedOn: moment(votesClose).format(ENDED_DATE_FORMAT).toLowerCase() };
};
