import { getTimeZoneAbbreviation } from "@helpers/dates";
import { ProcessedContest } from "lib/contests/types";
import moment from "moment";
import { ContestStateType, ContestTimingData, ContestTitleStateType, TimeWindowResult } from "./types";

export const getContestTitleState = (contest: ProcessedContest): ContestTitleStateType => {
  if (contest.isCanceled) return "canceled";

  const now = moment();
  const end = moment(contest.end_at);

  if (now.isSameOrAfter(end)) return "finished";

  return "active";
};

export const getContestState = (contest: ProcessedContest): ContestStateType => {
  if (contest.isCanceled) return null;

  const now = moment();
  const start = moment(contest.start_at);
  const voteStart = moment(contest.vote_start_at);
  const end = moment(contest.end_at);

  const isVotingOpen = now.isSameOrAfter(voteStart) && now.isBefore(end);
  const isSubmissionOpen = now.isSameOrAfter(start) && now.isBefore(voteStart);
  const isOpenToAnyone = contest.anyone_can_submit === 1;

  if (isVotingOpen) return "live";
  if (isSubmissionOpen && isOpenToAnyone) return "accepting-entries";

  return null;
};

export const formatDuration = (duration: moment.Duration): string => {
  const totalDays = Math.floor(duration.asDays());
  const hours = duration.hours();
  const minutes = duration.minutes();

  if (totalDays > 0) {
    return `${totalDays}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

const formatTimeWindow = (
  voteStart: moment.Moment,
  end: moment.Moment,
  useWeekdayFormat: boolean,
): TimeWindowResult => {
  const isSameDay = voteStart.isSame(end, "day");

  if (!isSameDay) {
    const startTime = `${voteStart.format("h")}${voteStart.format("a")}`;
    const endTime = `${end.format("h")}${end.format("a")}`;

    if (useWeekdayFormat) {
      // "5pm - sat 1am"
      const endDay = end.format("ddd").toLowerCase();
      return {
        display: `${startTime} - ${endDay} ${endTime}`,
        spansMultipleDays: true,
      };
    }

    // "5pm - jan 11 1am"
    const endDate = end.format("MMM D").toLowerCase();
    return {
      display: `${startTime} - ${endDate} ${endTime}`,
      spansMultipleDays: true,
    };
  }

  // Same day - show time range
  const startHour = voteStart.format("h");
  const startPeriod = voteStart.format("a");
  const endHour = end.format("h");
  const endPeriod = end.format("a");

  const isSamePeriod = startPeriod === endPeriod;

  if (isSamePeriod) {
    return { display: `${startHour}-${endHour}${endPeriod}`, spansMultipleDays: false };
  }

  return { display: `${startHour}${startPeriod}-${endHour}${endPeriod}`, spansMultipleDays: false };
};

const formatCountdown = (duration: moment.Duration): string => {
  const totalHours = Math.floor(duration.asHours());
  const minutes = duration.minutes();
  const seconds = duration.seconds();

  if (totalHours > 0) {
    return `${totalHours} hr ${minutes} min ${seconds} sec`;
  }

  if (minutes > 0) {
    return `${minutes} min ${seconds} sec`;
  }

  return `${seconds} sec`;
};

export const getContestTiming = (contest: ProcessedContest): ContestTimingData | null => {
  // Canceled takes priority
  if (contest.isCanceled) {
    return { format: "canceled", display: "canceled" };
  }

  const now = moment();
  const voteStart = moment(contest.vote_start_at);
  const end = moment(contest.end_at);

  const isContestEnded = now.isSameOrAfter(end);
  const isVotingOpen = now.isSameOrAfter(voteStart) && now.isBefore(end);

  if (isContestEnded) {
    return { format: "ended", display: "ended" };
  }

  // Voting is currently open - show countdown to end
  if (isVotingOpen) {
    const duration = moment.duration(end.diff(now));
    return {
      format: "countdown",
      display: formatCountdown(duration),
    };
  }

  // Voting not yet open - show fixed date/time (no countdown)
  // Within same week: show weekday (e.g., "fri, 5-7pm" or "fri 5pm - sat 1am")
  const isThisWeek = voteStart.isSame(now, "week");
  const timeWindow = formatTimeWindow(voteStart, end, isThisWeek);

  // Use comma separator for same-day, space for multi-day spans
  const separator = timeWindow.spansMultipleDays ? " " : ", ";
  const zoneAbbr = getTimeZoneAbbreviation(voteStart);

  if (isThisWeek) {
    const dayName = voteStart.format("ddd").toLowerCase();
    return {
      format: "weekday",
      display: `${dayName}${separator}${timeWindow.display}`,
      timeZoneAbbr: zoneAbbr,
    };
  }

  // Beyond current week: show date (e.g., "jan 10, 5-7pm" or "jan 10 5pm - jan 11 1am")
  const monthDay = voteStart.format("MMM D").toLowerCase();
  return {
    format: "date",
    display: `${monthDay}${separator}${timeWindow.display}`,
    timeZoneAbbr: zoneAbbr,
  };
};

export const getTimingUpdateInterval = (contest: ProcessedContest): number => {
  const now = moment();
  const voteStart = moment(contest.vote_start_at);
  const end = moment(contest.end_at);

  const isVotingOpen = now.isSameOrAfter(voteStart) && now.isBefore(end);

  // Voting is open - countdown to end, update every second
  if (isVotingOpen) return 1000;

  // Voting not open - using fixed dates, update every minute
  return 60000;
};

export const getUpdateInterval = (contestData: ProcessedContest): number => {
  const now = moment();
  let nextUpdate = moment(contestData.end_at);

  if (contestData.vote_start_at && now.isBefore(contestData.vote_start_at)) {
    nextUpdate = moment(contestData.vote_start_at);
  }

  const duration = moment.duration(nextUpdate.diff(now));
  const days = duration.asDays();
  const hours = duration.asHours();

  if (days > 1) {
    return 60 * 60 * 1000; // Update every hour
  } else if (hours > 1) {
    return 60 * 1000; // Update every minute
  }
  return 1000; // Update every second
};

export const isContestActive = (contest: ProcessedContest): boolean => {
  if (contest.isCanceled) return false;

  const now = moment();
  const end = moment(contest.end_at);

  return now.isBefore(end);
};
