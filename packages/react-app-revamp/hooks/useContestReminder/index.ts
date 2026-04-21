import { buildGoogleCalendarUrl, downloadIcsFile, generateCalendarTitle } from "@helpers/calendar";
import { useMediaQuery } from "react-responsive";

interface UseContestReminderParams {
  contestName: string;
  contestAddress: string;
  chainName: string;
  votesOpen: Date;
  votesClose: Date;
  entryTitle?: string;
}

type ContestReminder =
  | { kind: "ics"; trigger: () => void }
  | { kind: "link"; href: string; trigger: () => void };

export const useContestReminder = ({
  contestName,
  contestAddress,
  chainName,
  votesOpen,
  votesClose,
  entryTitle,
}: UseContestReminderParams): ContestReminder => {
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const title = generateCalendarTitle({ contestName, entryTitle });
  const event = { title, contestAddress, chainName, votesOpen, votesClose };

  if (isMobile) {
    return { kind: "ics", trigger: () => downloadIcsFile(event) };
  }

  const href = buildGoogleCalendarUrl(event);
  return {
    kind: "link",
    href,
    trigger: () => window.open(href, "_blank", "noopener,noreferrer"),
  };
};
