import { BellIcon } from "@heroicons/react/24/outline";
import { useContestReminder } from "@hooks/useContestReminder";
import { FC, MouseEvent } from "react";
import { META_LINK_CLASS_NAME, META_LINK_ICON_CLASS_NAME } from "../ContestName/constants";

interface ContestNotifyButtonProps {
  contestName: string;
  contestAddress: string;
  chainName: string;
  votesOpen: Date;
  votesClose: Date;
  entryTitle?: string;
  variant: "link" | "button";
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
  variant,
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

  return (
    <button
      id="add_to_calendar_button_click"
      onClick={handleClick}
      className={`flex h-10 w-full items-center justify-center gap-2 rounded-full bg-neutral-11 px-5 text-[15px] font-bold text-true-black transition-transform duration-150 active:scale-[0.97] ${className ?? ""}`}
    >
      <BellIcon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" strokeWidth={2.4} />
      {label}
    </button>
  );
};

export default ContestNotifyButton;
