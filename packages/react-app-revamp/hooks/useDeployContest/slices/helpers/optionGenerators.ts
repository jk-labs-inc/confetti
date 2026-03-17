import moment from "moment";
import { TimingOption } from "../contestTimingSlice";

export const generateVotingOpenMonthOptions = (): TimingOption[] => {
  const now = moment();
  const oneMonthFromNow = moment().add(1, "month");
  const months: TimingOption[] = [];
  const monthsSet = new Set<number>();

  let current = now.clone().startOf("day");
  while (current.isSameOrBefore(oneMonthFromNow)) {
    const monthNum = current.month();
    if (!monthsSet.has(monthNum)) {
      monthsSet.add(monthNum);
      months.push({
        label: current.format("MMMM"),
        value: monthNum.toString(),
      });
    }
    current.add(1, "day");
  }

  return months;
};

export const generateVotingOpenDayOptions = (votingOpenMonth: number): TimingOption[] => {
  const now = moment();
  const oneMonthFromNow = moment().add(1, "month");
  const days: TimingOption[] = [];

  let current = now.clone().startOf("day");
  while (current.isSameOrBefore(oneMonthFromNow)) {
    if (current.month() === votingOpenMonth) {
      days.push({
        label: current.format("D"),
        value: current.date().toString(),
      });
    }
    current.add(1, "day");
  }

  return days;
};

export const formatHourLabel = (hour24: number): string => {
  if (hour24 === 0) return "12:00 am";
  if (hour24 < 12) return `${hour24}:00 am`;
  if (hour24 === 12) return "12:00 pm";
  return `${hour24 - 12}:00 pm`;
};

export const HOUR_OPTIONS: TimingOption[] = Array.from({ length: 24 }, (_, i) => ({
  label: formatHourLabel(i),
  value: i.toString(),
}));

export const DURATION_OPTIONS: TimingOption[] = Array.from({ length: 6 }, (_, i) => ({
  label: i === 0 ? "1 hour" : `${i + 1} hours`,
  value: (i + 1).toString(),
}));
