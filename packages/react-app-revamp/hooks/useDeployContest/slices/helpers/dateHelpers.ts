import moment from "moment";

export interface TimingDetails {
  month: number;
  day: number;
  hour: number; // 0-23 (24-hour format)
}

export const createDateFromTiming = (timing: TimingDetails): Date => {
  const now = moment();

  const date = moment()
    .year(now.year())
    .month(timing.month)
    .date(timing.day)
    .hour(timing.hour)
    .minute(0)
    .second(0)
    .millisecond(0);

  if (date.isBefore(now)) {
    date.add(1, "year");
  }

  return date.toDate();
};

export const convertDateToTimingDetails = (date: Date): TimingDetails => {
  const dateMoment = moment(date);
  return {
    month: dateMoment.month(),
    day: dateMoment.date(),
    hour: dateMoment.hour(),
  };
};
