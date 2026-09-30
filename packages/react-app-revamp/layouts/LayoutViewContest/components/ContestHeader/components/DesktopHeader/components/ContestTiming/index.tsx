import { getCountdownSegments } from "@helpers/dates";
import { MOBILE_MAX_WIDTH_PX } from "@helpers/isMobileViewport";
import { useContestStore } from "@hooks/useContest/store";
import { ContestStateEnum, useContestStateStore } from "@hooks/useContestState/store";
import { useCountdownTimer } from "@hooks/useTimer";
import moment from "moment";
import { FC, ReactNode, useMemo } from "react";
import { useMediaQuery } from "react-responsive";

export type ContestTimingVariant = "stat" | "headline";

interface ContestTimingProps {
  variant?: ContestTimingVariant;
}

const HEADLINE_SEGMENT_COUNT = 2;
const ENDED_DATE_FORMAT = "MMM D";

const VARIANT_CLASS_NAMES: Record<
  ContestTimingVariant,
  { emoji: string; text: string; segmentValue: string; segmentUnit: string }
> = {
  stat: {
    emoji: "text-2xl",
    text: "text-[16px] md:text-[24px] font-bold md:font-normal",
    segmentValue: "text-[20px] md:text-[24px] font-bold",
    segmentUnit: "text-base font-bold",
  },
  headline: {
    emoji: "text-[22px] wide:text-[24px]",
    text: "text-[15px] wide:text-[16px]",
    segmentValue: "text-[22px] wide:text-[24px] font-bold",
    segmentUnit: "text-[15px] wide:text-[16px]",
  },
};

const formatScheduleWindow = (voteStart: moment.Moment, end: moment.Moment): string => {
  const startDate = voteStart.format("MMM D").toLowerCase();
  const endDate = end.format("MMM D").toLowerCase();
  const startTime = `${voteStart.format("h")}${voteStart.format("a")}`;
  const endTime = `${end.format("h")}${end.format("a")}`;

  if (voteStart.isSame(end, "day")) {
    const samePeriod = voteStart.format("a") === end.format("a");
    const range = samePeriod ? `${voteStart.format("h")}-${endTime}` : `${startTime}-${endTime}`;

    return `${startDate}, ${range}`;
  }

  return `${startDate}, ${startTime} - ${endDate}, ${endTime}`;
};

const ContestTiming: FC<ContestTimingProps> = ({ variant = "stat" }) => {
  const { votesOpen, votesClose } = useContestStore(state => state);
  const { contestState } = useContestStateStore(state => state);
  const isCanceled = contestState === ContestStateEnum.Canceled;
  const votingTimeLeft = useCountdownTimer(votesClose);
  const isMobile = useMediaQuery({ maxWidth: MOBILE_MAX_WIDTH_PX });
  const isHeadline = variant === "headline";
  const classNames = VARIANT_CLASS_NAMES[variant];

  const display = useMemo<{ content: ReactNode; dimmed: boolean }>(() => {
    if (isCanceled) return { content: "canceled", dimmed: true };

    const now = moment();
    const voteStart = moment(votesOpen);
    const end = moment(votesClose);

    if (now.isSameOrAfter(end)) {
      const content = isHeadline ? `voting ended ${end.format(ENDED_DATE_FORMAT).toLowerCase()}` : "ended";
      return { content, dimmed: true };
    }

    if (now.isSameOrAfter(voteStart) && now.isBefore(end)) {
      const allSegments = getCountdownSegments(votingTimeLeft, isMobile && !isHeadline);
      const segments = isHeadline ? allSegments.slice(0, HEADLINE_SEGMENT_COUNT) : allSegments;
      const content = segments.map((seg, i) => (
        <span key={i}>
          <span className={classNames.segmentValue}>{seg.value}</span>{" "}
          <span className={classNames.segmentUnit}>{seg.unit}</span>
          {i < segments.length - 1 ? " " : ""}
        </span>
      ));
      return { content, dimmed: false };
    }

    return {
      content: formatScheduleWindow(voteStart, end),
      dimmed: false,
    };
  }, [isCanceled, votesOpen, votesClose, votingTimeLeft, isMobile, isHeadline, classNames]);

  return (
    <div
      className={`flex items-baseline gap-1 whitespace-nowrap ${display.dimmed ? "text-neutral-9" : "text-neutral-11"}`}
    >
      <span className={classNames.emoji}>⏱️</span>
      <p className={classNames.text}>{display.content}</p>
    </div>
  );
};

export default ContestTiming;
