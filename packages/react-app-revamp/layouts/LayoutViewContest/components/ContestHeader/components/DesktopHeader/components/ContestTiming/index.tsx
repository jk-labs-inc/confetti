import { useContestStore } from "@hooks/useContest/store";
import { ContestStateEnum, useContestStateStore } from "@hooks/useContestState/store";
import { useCountdownTimer } from "@hooks/useTimer";
import moment from "moment";
import { useMemo } from "react";

const formatCountdown = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours} hr ${minutes} min ${seconds} sec`;
  }

  if (minutes > 0) {
    return `${minutes} min ${seconds} sec`;
  }

  return `${seconds} sec`;
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

const ContestTiming = () => {
  const { votesOpen, votesClose } = useContestStore(state => state);
  const { contestState } = useContestStateStore(state => state);
  const isCanceled = contestState === ContestStateEnum.Canceled;
  const votingTimeLeft = useCountdownTimer(votesClose);

  const display = useMemo(() => {
    if (isCanceled) return { text: "canceled", dimmed: true };

    const now = moment();
    const voteStart = moment(votesOpen);
    const end = moment(votesClose);

    if (now.isSameOrAfter(end)) return { text: "ended", dimmed: true };

    // Voting open — show countdown
    if (now.isSameOrAfter(voteStart) && now.isBefore(end)) {
      return { text: formatCountdown(votingTimeLeft), dimmed: false };
    }

    // Voting not yet open — show date/time like landing page
    const isThisWeek = voteStart.isSame(now, "week");
    const timeWindow = formatTimeWindow(voteStart, end, isThisWeek);
    const separator = timeWindow.spansMultipleDays ? " " : ", ";

    if (isThisWeek) {
      const dayName = voteStart.format("ddd").toLowerCase();
      return { text: `${dayName}${separator}${timeWindow.display}`, dimmed: false };
    }

    const monthDay = voteStart.format("MMM D").toLowerCase();
    return { text: `${monthDay}${separator}${timeWindow.display}`, dimmed: false };
  }, [isCanceled, votesOpen, votesClose, votingTimeLeft]);

  return (
    <div className="flex items-baseline gap-1 whitespace-nowrap">
      <span className="text-2xl">⏱️</span>
      <p className={`text-base text-neutral-9 font-bold`}>{display.text}</p>
    </div>
  );
};

export default ContestTiming;
