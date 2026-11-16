import { formatCompactCountdown } from "@helpers/dates";
import { useContestStore } from "@hooks/useContest/store";
import { useCountdownTimer } from "@hooks/useTimer";
import { FC } from "react";

const OPENING_LABEL = "now";

const PreVoteCountdown: FC = () => {
  const votesOpen = useContestStore(state => state.votesOpen);
  const secondsUntilVotingOpens = useCountdownTimer(votesOpen);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[13px] text-neutral-9">voting opens in</span>
      <span className="font-sabo-filled whitespace-nowrap text-[38px] uppercase leading-none text-neutral-11">
        {secondsUntilVotingOpens > 0 ? formatCompactCountdown(secondsUntilVotingOpens) : OPENING_LABEL}
      </span>
    </div>
  );
};

export default PreVoteCountdown;
