import { generateUrlContest } from "./share";

const formatDateForIcs = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
};

const escapeIcsText = (text: string): string => {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
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

export const downloadIcsFile = ({
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
}) => {
  const contestUrl = generateUrlContest(contestAddress, chainName);

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    "PRODID:-//Confetti//EN",
    "BEGIN:VEVENT",
    `UID:${contestAddress}-${chainName}@confetti.win`,
    `DTSTART:${formatDateForIcs(votesOpen)}`,
    `DTEND:${formatDateForIcs(votesClose)}`,
    `SUMMARY:${escapeIcsText(title)}`,
    `DESCRIPTION:${escapeIcsText(`Contest link: ${contestUrl}`)}`,
    `URL:${contestUrl}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "voting-reminder.ics";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
