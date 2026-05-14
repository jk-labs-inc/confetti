import moment from "moment-timezone";

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
