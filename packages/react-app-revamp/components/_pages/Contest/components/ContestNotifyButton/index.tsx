import { useContestReminder } from "@hooks/useContestReminder";
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
  const reminder = useContestReminder({
    contestName,
    contestAddress,
    chainName,
    votesOpen,
    votesClose,
    entryTitle,
  });

  if (new Date() >= votesOpen) return null;

  const containerSize = size === "sm" ? "w-10 h-7" : "w-12 h-8";
  const iconSize = size === "sm" ? 12 : 16;
  const className = `flex items-center justify-center ${containerSize} bg-gradient-metallic rounded-[40px] cursor-pointer`;
  const ariaLabel = "Remind me when voting opens";

  const icon = (
    <img src="/contest/reminder.svg" alt="" width={iconSize} height={iconSize} />
  );

  if (reminder.kind === "link") {
    return (
      <a
        href={reminder.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
        className={className}
      >
        {icon}
      </a>
    );
  }

  return (
    <button onClick={reminder.trigger} aria-label={ariaLabel} className={className}>
      {icon}
    </button>
  );
};

export default ContestNotifyButton;
