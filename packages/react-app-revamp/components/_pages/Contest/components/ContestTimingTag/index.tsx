import { STICKER_RING_CLASS_NAME } from "@components/UI/RewardsSticker/constants";
import { useContestClockStage } from "@hooks/useContestClockStage";
import { ContestClockStage } from "@hooks/useContestClockStage/types";
import { FC } from "react";

interface ContestTimingTagProps {
  className?: string;
}

const getTagLabel = (clockStage: ContestClockStage): string => {
  switch (clockStage.stage) {
    case "canceled":
      return "canceled";
    case "upcoming":
      return `opens in ${clockStage.countdown}`;
    case "live":
      return `ends in ${clockStage.countdown}`;
    case "ended":
      return `ended ${clockStage.endedOn}`;
  }
};

const ContestTimingTag: FC<ContestTimingTagProps> = ({ className = "" }) => {
  const clockStage = useContestClockStage();
  const isDimmed = clockStage.stage === "canceled" || clockStage.stage === "ended";

  return (
    <span
      className={`relative z-2 flex shrink-0 rotate-5 items-center gap-1.5 whitespace-nowrap rounded-[9px] bg-neutral-5 py-1 pl-2 pr-2.5 text-[13px] font-black ${isDimmed ? "text-neutral-9" : "text-neutral-11"} ${STICKER_RING_CLASS_NAME} ${className}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 26"
        className={`h-4 w-[15px] shrink-0 fill-none stroke-current stroke-[2.5] ${isDimmed ? "" : "text-primary-10"}`}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 2h4" />
        <circle cx="12" cy="15" r="9" />
        <path d="M12 15V10" />
      </svg>
      {getTagLabel(clockStage)}
    </span>
  );
};

export default ContestTimingTag;
