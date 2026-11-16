import { formatCompactCountdown } from "@helpers/dates";
import { useContestStore } from "@hooks/useContest/store";
import { ContestStateEnum, useContestStateStore } from "@hooks/useContestState/store";
import { useCountdownTimer } from "@hooks/useTimer";
import moment from "moment";
import { FC } from "react";
import { useShallow } from "zustand/shallow";

type ContestClockSize = "md" | "sm";

interface ContestClockProps {
  size?: ContestClockSize;
}

interface ContestClockDisplay {
  lead?: string;
  value: string;
  trail?: string;
  isDimmed: boolean;
}

const ENDED_DATE_FORMAT = "MMM D";
const MS_PER_SECOND = 1000;
const CAPTION_CLASS_NAME = "text-[13px] text-neutral-9";

const SIZE_CLASS_NAMES: Record<ContestClockSize, { root: string; icon: string; liveIcon: string; value: string }> = {
  md: { root: "gap-2", icon: "h-4 w-[15px]", liveIcon: "", value: "text-base" },
  sm: { root: "gap-[5px]", icon: "h-3.5 w-[13px]", liveIcon: "text-primary-10", value: "text-[14px]" },
};

const getContestClockDisplay = ({
  isCanceled,
  votesOpen,
  votesClose,
  votingSecondsLeft,
}: {
  isCanceled: boolean;
  votesOpen: Date;
  votesClose: Date;
  votingSecondsLeft: number;
}): ContestClockDisplay => {
  if (isCanceled) return { value: "canceled", isDimmed: true };

  const msUntilVotingOpens = votesOpen.getTime() - Date.now();
  if (msUntilVotingOpens > 0) {
    return {
      lead: "opens in",
      value: formatCompactCountdown(Math.ceil(msUntilVotingOpens / MS_PER_SECOND)),
      isDimmed: false,
    };
  }

  if (votingSecondsLeft > 0) {
    return { value: formatCompactCountdown(votingSecondsLeft), trail: "left", isDimmed: false };
  }

  return { lead: "ended", value: moment(votesClose).format(ENDED_DATE_FORMAT).toLowerCase(), isDimmed: true };
};

const ContestClock: FC<ContestClockProps> = ({ size = "md" }) => {
  const { votesOpen, votesClose } = useContestStore(
    useShallow(state => ({ votesOpen: state.votesOpen, votesClose: state.votesClose })),
  );
  const isCanceled = useContestStateStore(useShallow(state => state.contestState === ContestStateEnum.Canceled));
  const votingSecondsLeft = useCountdownTimer(votesClose);
  const { lead, value, trail, isDimmed } = getContestClockDisplay({
    isCanceled,
    votesOpen,
    votesClose,
    votingSecondsLeft,
  });
  const sizeClassNames = SIZE_CLASS_NAMES[size];

  return (
    <span
      className={`flex items-center whitespace-nowrap ${sizeClassNames.root} ${isDimmed ? "text-neutral-9" : "text-neutral-11"}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 26"
        className={`shrink-0 fill-none stroke-current stroke-[2.5] ${sizeClassNames.icon} ${isDimmed ? "" : sizeClassNames.liveIcon}`}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 2h4" />
        <circle cx="12" cy="15" r="9" />
        <path d="M12 15V10" />
      </svg>
      <span className={`flex items-baseline ${sizeClassNames.root}`}>
        {lead && <span className={CAPTION_CLASS_NAME}>{lead}</span>}
        <span className={`font-bold ${sizeClassNames.value}`}>{value}</span>
        {trail && <span className={CAPTION_CLASS_NAME}>{trail}</span>}
      </span>
    </span>
  );
};

export default ContestClock;
