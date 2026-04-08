import { BellIcon } from "@heroicons/react/24/solid";
import { generateCalendarTitle, generateGoogleCalendarUrl } from "@helpers/calendar";
import { FC } from "react";

interface ContestNotifyButtonProps {
  contestName: string;
  contestAddress: string;
  chainName: string;
  votesOpen: Date;
  votesClose: Date;
  entryTitle?: string;
  size?: "sm" | "md";
}

const ContestNotifyButton: FC<ContestNotifyButtonProps> = ({
  contestName,
  contestAddress,
  chainName,
  votesOpen,
  votesClose,
  entryTitle,
  size = "md",
}) => {
  if (new Date() >= votesOpen) return null;

  const title = generateCalendarTitle({ contestName, entryTitle });
  const calendarUrl = generateGoogleCalendarUrl({
    title,
    contestAddress,
    chainName,
    votesOpen,
    votesClose,
  });

  const containerSize = size === "sm" ? "w-10 h-7" : "w-12 h-8";
  const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";

  return (
    <a
      href={calendarUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="Get notified when voting opens"
      className={`flex items-center justify-center ${containerSize} bg-gradient-metallic rounded-[40px]`}
    >
      <BellIcon className={`${iconSize} text-true-black`} />
    </a>
  );
};

export default ContestNotifyButton;
