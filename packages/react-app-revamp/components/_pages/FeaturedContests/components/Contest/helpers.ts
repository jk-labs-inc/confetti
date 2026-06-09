import { getTimeZoneAbbreviation } from "@helpers/dates";
import { ProcessedContest } from "lib/contests/types";
import moment from "moment";
import { ContestStateType, ContestTimingData, ContestTitleStateType } from "./types";

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

const formatScheduleWindow = (voteStart: moment.Moment, end: moment.Moment, useWeekdayFormat: boolean): string => {
  const isSameDay = voteStart.isSame(end, "day");

  if (isSameDay) {
    const dayLabel = useWeekdayFormat ? voteStart.format("ddd").toLowerCase() : voteStart.format("MMM D").toLowerCase();
    const startHour = voteStart.format("h");
    const startPeriod = voteStart.format("a");
    const endHour = end.format("h");
    const endPeriod = end.format("a");
    const range =
      startPeriod === endPeriod
        ? `${startHour}-${endHour}${endPeriod}`
        : `${startHour}${startPeriod}-${endHour}${endPeriod}`;

    return `${dayLabel}, ${range}`;
  }

  const startDate = voteStart.format("MMM D").toLowerCase();
  const endDate = end.format("MMM D").toLowerCase();
  const startTime = `${voteStart.format("h")}${voteStart.format("a")}`;
  const endTime = `${end.format("h")}${end.format("a")}`;

  if (startTime === endTime) {
    return `${startDate} - ${endDate}, ${startTime}`;
  }

  return `${startDate}, ${startTime} - ${endDate}, ${endTime}`;
};

const formatCountdown = (duration: moment.Duration): string => {
  const days = Math.floor(duration.asDays());
  const hours = duration.hours();
  const minutes = duration.minutes();
  const seconds = duration.seconds();

  // Days for long (up to 7-day) contests ("6d 23h"); once under a day it becomes a live
  // h/m/s tick ("23h 45m 12s") so the final 24h counts down second by second.
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
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

  const isThisWeek = voteStart.isSame(now, "week");
  const isSameDay = voteStart.isSame(end, "day");
  const zoneAbbr = getTimeZoneAbbreviation(voteStart);

  return {
    format: isSameDay && isThisWeek ? "weekday" : "date",
    display: formatScheduleWindow(voteStart, end, isThisWeek),
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
