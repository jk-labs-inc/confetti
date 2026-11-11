import { STICKER_RING_CLASS_NAME } from "@components/UI/RewardsSticker/constants";
import { formatCompactCountdown } from "@helpers/dates";
import { useContestStore } from "@hooks/useContest/store";
import { ContestStateEnum, useContestStateStore } from "@hooks/useContestState/store";
import { useCountdownTimer } from "@hooks/useTimer";
import moment from "moment";
import { FC } from "react";
import { useShallow } from "zustand/shallow";

const ENDED_DATE_FORMAT = "MMM D";
const MS_PER_SECOND = 1000;

interface TimingTagDisplay {
  label: string;
  isDimmed: boolean;
}

const getTimingTagDisplay = ({
  isCanceled,
  votesOpen,
  votesClose,
  votingSecondsLeft,
}: {
  isCanceled: boolean;
  votesOpen: Date;
  votesClose: Date;
  votingSecondsLeft: number;
}): TimingTagDisplay => {
  if (isCanceled) return { label: "canceled", isDimmed: true };

  const msUntilVotingOpens = votesOpen.getTime() - Date.now();
  if (msUntilVotingOpens > 0) {
    return {
      label: `opens in ${formatCompactCountdown(Math.ceil(msUntilVotingOpens / MS_PER_SECOND))}`,
      isDimmed: false,
    };
  }

  if (votingSecondsLeft > 0) return { label: `ends in ${formatCompactCountdown(votingSecondsLeft)}`, isDimmed: false };

  return { label: `ended ${moment(votesClose).format(ENDED_DATE_FORMAT).toLowerCase()}`, isDimmed: true };
};

const ContestTimingTag: FC = () => {
  const { votesOpen, votesClose } = useContestStore(
    useShallow(state => ({ votesOpen: state.votesOpen, votesClose: state.votesClose })),
  );
  const isCanceled = useContestStateStore(useShallow(state => state.contestState === ContestStateEnum.Canceled));
  const votingSecondsLeft = useCountdownTimer(votesClose);
  const { label, isDimmed } = getTimingTagDisplay({ isCanceled, votesOpen, votesClose, votingSecondsLeft });

  return (
    <span
      className={`relative z-2 flex rotate-5 items-center gap-1.5 whitespace-nowrap rounded-[9px] bg-neutral-5 py-1 pl-2 pr-2.5 text-[13px] font-black ${isDimmed ? "text-neutral-9" : "text-neutral-11"} ${STICKER_RING_CLASS_NAME}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 26"
        className="h-4 w-[15px] shrink-0 fill-none stroke-current stroke-[2.5]"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 2h4" />
        <circle cx="12" cy="15" r="9" />
        <path d="M12 15V10" />
      </svg>
      {label}
    </span>
  );
};

export default ContestTimingTag;
