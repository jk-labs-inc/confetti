import moment from "moment-timezone";

export interface CountdownSegment {
  value: number;
  unit: string;
}

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_DAY = 86400;
const COMPACT_SEGMENT_COUNT = 2;
const ENDED_LABEL = "ended";
const ZERO_LABEL = "0s";

/**
 * Format date using Moment.js
 * @param dateString - The date string to format
 * @returns The formatted date string (example: "March 13, 12:00 PM")
 */
export const formatDate = (dateString: string): string => {
  return moment(dateString).format("MMMM D, h:mm a").toLowerCase();
};

/**
 * @param date - The date to resolve the abbreviation for; defaults to now
 * @returns The time zone abbreviation
 */
export const getTimeZoneAbbreviation = (date?: moment.MomentInput): string => {
  const zone = moment.tz.guess();
  return moment.tz(date, zone).zoneAbbr();
};

export const formatTimeAgo = (createdAtSec: number, nowMs: number): string => {
  const elapsed = Math.max(0, Math.floor(nowMs / 1000) - createdAtSec);
  if (elapsed < 60) return "just now";
  if (elapsed < 3600) return `${Math.floor(elapsed / 60)}m ago`;
  if (elapsed < 86400) return `${Math.floor(elapsed / 3600)}h ago`;
  return `${Math.floor(elapsed / 86400)}d ago`;
};

const unitLabel = (count: number, singular: string, plural: string) => (count === 1 ? singular : plural);

export const getCountdownSegments = (totalSeconds: number, compact = false): CountdownSegment[] => {
  const days = Math.floor(totalSeconds / SECONDS_PER_DAY);
  const hours = Math.floor((totalSeconds % SECONDS_PER_DAY) / SECONDS_PER_HOUR);
  const minutes = Math.floor((totalSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const seconds = totalSeconds % SECONDS_PER_MINUTE;

  const d = compact ? "d" : unitLabel(days, "day", "days");
  const h = compact ? "h" : unitLabel(hours, "hr", "hrs");
  const m = compact ? "m" : unitLabel(minutes, "min", "mins");
  const s = compact ? "s" : unitLabel(seconds, "sec", "secs");

  if (days > 0) {
    return [
      { value: days, unit: d },
      { value: hours, unit: h },
      { value: minutes, unit: m },
      { value: seconds, unit: s },
    ];
  }

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

export const formatCompactCountdown = (totalSeconds: number): string => {
  if (totalSeconds <= 0) return ENDED_LABEL;

  const label = getCountdownSegments(totalSeconds, true)
    .filter(segment => segment.value > 0)
    .slice(0, COMPACT_SEGMENT_COUNT)
    .map(segment => `${segment.value}${segment.unit}`)
    .join(" ");

  return label || ZERO_LABEL;
};
