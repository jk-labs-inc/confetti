import { BellIcon } from "@heroicons/react/24/outline";
import { useContestReminder } from "@hooks/useContestReminder";
import { motion } from "motion/react";
import { FC, MouseEvent } from "react";
import { META_LINK_CLASS_NAME, META_LINK_ICON_CLASS_NAME } from "../ContestName/constants";

interface ContestNotifyButtonProps {
  contestName: string;
  contestAddress: string;
  chainName: string;
  votesOpen: Date;
  votesClose: Date;
  entryTitle?: string;
  size?: "sm" | "md";
  variant?: "pill" | "link" | "button";
  label?: string;
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
  variant = "pill",
  label = "remind me",
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

  if (variant === "link") {
    return (
      <button id="add_to_calendar_button_click" onClick={handleClick} className={META_LINK_CLASS_NAME}>
        <BellIcon className={META_LINK_ICON_CLASS_NAME} strokeWidth={2} />
        {label}
      </button>
    );
  }

  if (variant === "button") {
    return (
      <button
        id="add_to_calendar_button_click"
        onClick={handleClick}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-neutral-11 px-5 text-[16px] font-bold text-true-black transition-transform duration-150 active:scale-[0.97]"
      >
        <BellIcon aria-hidden="true" className="h-4 w-4 shrink-0" strokeWidth={2.4} />
        {label}
      </button>
    );
  }

  return (
    <motion.button
      id="add_to_calendar_button_click"
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
