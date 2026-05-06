import { useContestReminder } from "@hooks/useContestReminder";
import { motion } from "motion/react";
import { FC, MouseEvent } from "react";

interface ContestNotifyButtonProps {
  contestName: string;
  contestAddress: string;
  chainName: string;
  votesOpen: Date;
  votesClose: Date;
  entryTitle?: string;
  size?: "sm" | "md";
  className?: string;
}

const ContestNotifyButton: FC<ContestNotifyButtonProps> = ({
  contestName,
  contestAddress,
  chainName,
  votesOpen,
  votesClose,
  entryTitle,
  size = "md",
  className,
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
  const iconSize = size === "sm" ? 16 : 20;
  const buttonClassName = `flex items-center justify-center ${containerSize} bg-gradient-calendar rounded-[40px] cursor-pointer ${className ?? ""}`;

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    reminder.trigger();
  };

  return (
    <motion.button
      onClick={handleClick}
      aria-label="Remind me when voting opens"
      className={buttonClassName}
      whileTap={{ scale: 0.97 }}
    >
      <img src="/contest/reminder.svg" alt="" width={iconSize} height={iconSize} />
    </motion.button>
  );
};

export default ContestNotifyButton;
