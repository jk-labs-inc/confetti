import { useContestClockStage } from "@hooks/useContestClockStage";
import { ContestClockStage } from "@hooks/useContestClockStage/types";
import { FC } from "react";

interface ClockParts {
  lead?: string;
  value: string;
  trail?: string;
}

const CAPTION_CLASS_NAME = "text-[13px] text-neutral-9";

const getClockParts = (clockStage: ContestClockStage): ClockParts => {
  switch (clockStage.stage) {
    case "canceled":
      return { value: "canceled" };
    case "upcoming":
      return { lead: "opens in", value: clockStage.countdown };
    case "live":
      return { value: clockStage.countdown, trail: "left" };
    case "ended":
      return { lead: "ended", value: clockStage.endedOn };
  }
};

const ContestClock: FC = () => {
  const clockStage = useContestClockStage();
  const isDimmed = clockStage.stage === "canceled" || clockStage.stage === "ended";
  const { lead, value, trail } = getClockParts(clockStage);

  return (
    <span
      className={`flex items-center gap-[5px] whitespace-nowrap ${isDimmed ? "text-neutral-9" : "text-neutral-11"}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 26"
        className={`h-3.5 w-[13px] shrink-0 fill-none stroke-current stroke-[2.5] ${isDimmed ? "" : "text-primary-10"}`}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 2h4" />
        <circle cx="12" cy="15" r="9" />
        <path d="M12 15V10" />
      </svg>
      <span className="flex items-baseline gap-[5px]">
        {lead && <span className={CAPTION_CLASS_NAME}>{lead}</span>}
        <span className="text-[14px] font-bold">{value}</span>
        {trail && <span className={CAPTION_CLASS_NAME}>{trail}</span>}
      </span>
    </span>
  );
};

export default ContestClock;
