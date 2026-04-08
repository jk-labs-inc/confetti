import { generateUrlContest } from "./share";

const GOOGLE_CALENDAR_BASE_URL = "https://calendar.google.com/calendar/render";

const formatDateForCalendar = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
};

export const generateCalendarTitle = ({
  contestName,
  entryTitle,
}: {
  contestName: string;
  entryTitle?: string;
}): string => {
  if (entryTitle) {
    return `Voting ${entryTitle} for ${contestName}`;
  }
  return `Voting on ${contestName}`;
};

export const generateGoogleCalendarUrl = ({
  title,
  contestAddress,
  chainName,
  votesOpen,
  votesClose,
}: {
  title: string;
  contestAddress: string;
  chainName: string;
  votesOpen: Date;
  votesClose: Date;
}): string => {
  const contestUrl = generateUrlContest(contestAddress, chainName);
  const details = `Contest link: ${contestUrl}`;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${formatDateForCalendar(votesOpen)}/${formatDateForCalendar(votesClose)}`,
    details,
  });

  return `${GOOGLE_CALENDAR_BASE_URL}?${params.toString()}`;
};
