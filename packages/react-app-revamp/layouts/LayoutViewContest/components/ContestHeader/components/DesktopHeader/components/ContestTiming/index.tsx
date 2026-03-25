import { useContestStore } from "@hooks/useContest/store";
import { ContestStateEnum, useContestStateStore } from "@hooks/useContestState/store";
import { useCountdownTimer } from "@hooks/useTimer";
import moment from "moment";
import { FC, ReactNode, useMemo } from "react";

interface CountdownSegment {
  value: number;
  unit: string;
}

const getCountdownSegments = (totalSeconds: number, compact = false): CountdownSegment[] => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const h = compact ? "h" : "hr";
  const m = compact ? "m" : "min";
  const s = compact ? "s" : "sec";

  if (hours > 0) {
    return [
      { value: hours, unit: h },
      { value: minutes, unit: m },
      { value: seconds, unit: s },
    ];
  }

  if (minutes > 0) {
    return [
      { value: minutes, unit: m },
      { value: seconds, unit: s },
    ];
  }

  return [{ value: seconds, unit: s }];
};

const formatTimeWindow = (
  voteStart: moment.Moment,
  end: moment.Moment,
  useWeekdayFormat: boolean,
): { display: string; spansMultipleDays: boolean } => {
  const isSameDay = voteStart.isSame(end, "day");

  if (!isSameDay) {
    const startTime = `${voteStart.format("h")}${voteStart.format("a")}`;
    const endTime = `${end.format("h")}${end.format("a")}`;

    if (useWeekdayFormat) {
      const endDay = end.format("ddd").toLowerCase();
      return { display: `${startTime} - ${endDay} ${endTime}`, spansMultipleDays: true };
    }

    const endDate = end.format("MMM D").toLowerCase();
    return { display: `${startTime} - ${endDate} ${endTime}`, spansMultipleDays: true };
  }

  const startHour = voteStart.format("h");
  const startPeriod = voteStart.format("a");
  const endHour = end.format("h");
  const endPeriod = end.format("a");

  if (startPeriod === endPeriod) {
    return { display: `${startHour}-${endHour}${endPeriod}`, spansMultipleDays: false };
  }

  return { display: `${startHour}${startPeriod}-${endHour}${endPeriod}`, spansMultipleDays: false };
};

interface ContestTimingProps {
  compact?: boolean;
}

const ContestTiming: FC<ContestTimingProps> = ({ compact = false }) => {
  const { votesOpen, votesClose } = useContestStore(state => state);
  const { contestState } = useContestStateStore(state => state);
  const isCanceled = contestState === ContestStateEnum.Canceled;
  const votingTimeLeft = useCountdownTimer(votesClose);

  const display = useMemo<{ content: ReactNode; dimmed: boolean }>(() => {
    if (isCanceled) return { content: "canceled", dimmed: true };

    const now = moment();
    const voteStart = moment(votesOpen);
    const end = moment(votesClose);

    if (now.isSameOrAfter(end)) return { content: "ended", dimmed: true };

    if (now.isSameOrAfter(voteStart) && now.isBefore(end)) {
      const segments = getCountdownSegments(votingTimeLeft, compact);
      const content = segments.map((seg, i) => (
        <span key={i}>
          <span className="text-base md:text-[24px] md:font-normal">{seg.value}</span>{" "}
          <span className="text-base">{seg.unit}</span>
          {i < segments.length - 1 ? " " : ""}
        </span>
      ));
      return { content, dimmed: false };
    }

    const isThisWeek = voteStart.isSame(now, "week");
    const timeWindow = formatTimeWindow(voteStart, end, isThisWeek);
    const separator = timeWindow.spansMultipleDays ? " " : ", ";

    if (isThisWeek) {
      const dayName = voteStart.format("ddd").toLowerCase();
      return { content: `${dayName}${separator}${timeWindow.display}`, dimmed: false };
    }

    const monthDay = voteStart.format("MMM D").toLowerCase();
    return { content: `${monthDay}${separator}${timeWindow.display}`, dimmed: false };
  }, [isCanceled, votesOpen, votesClose, votingTimeLeft, compact]);

  return (
    <div className="flex items-baseline gap-1 whitespace-nowrap">
      <span className="text-2xl">⏱️</span>
      <p className={`text-base font-bold ${display.dimmed ? "text-neutral-9" : "text-neutral-11"}`}>
        {display.content}
      </p>
    </div>
  );
};

export default ContestTiming;
