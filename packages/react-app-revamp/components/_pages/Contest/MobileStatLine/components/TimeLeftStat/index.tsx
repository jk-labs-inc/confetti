import { formatCompactCountdown } from "@helpers/dates";
import { useContestStore } from "@hooks/useContest/store";
import { ContestStatus, useContestStatusStore } from "@hooks/useContestStatus/store";
import { useCountdownTimer } from "@hooks/useTimer";
import { FC } from "react";

const TimeLeftStat: FC = () => {
  const votesClose = useContestStore(state => state.votesClose);
  const isVotingOpen = useContestStatusStore(state => state.contestStatus) === ContestStatus.VotingOpen;
  const secondsLeft = useCountdownTimer(votesClose);

  if (!isVotingOpen) return <span className="shrink-0">voting ended</span>;

  return (
    <span className="shrink-0">
      <b className="font-bold text-neutral-11">{formatCompactCountdown(secondsLeft)}</b> left
    </span>
  );
};

export default TimeLeftStat;
