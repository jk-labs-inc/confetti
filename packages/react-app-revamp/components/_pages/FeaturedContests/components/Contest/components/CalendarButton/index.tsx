import { useContestReminder } from "@hooks/useContestReminder";
import { motion } from "motion/react";
import { FC, MouseEvent } from "react";

interface CalendarButtonProps {
  contestName: string;
  contestAddress: string;
  chainName: string;
  votesOpen: Date;
  votesClose: Date;
}

const CalendarButton: FC<CalendarButtonProps> = ({ contestName, contestAddress, chainName, votesOpen, votesClose }) => {
  const reminder = useContestReminder({
    contestName,
    contestAddress,
    chainName,
    votesOpen,
    votesClose,
  });

  if (new Date() >= votesOpen) return null;

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    reminder.trigger();
  };

  return (
    <motion.button
      id="add_to_calendar_button_click"
      onClick={handleClick}
      aria-label="Remind me when voting opens"
      className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-calendar cursor-pointer shrink-0 self-start after:content-[''] after:w-4 after:h-4 after:bg-[url('/contest/reminder.svg')] after:bg-contain after:bg-center after:bg-no-repeat"
      whileTap={{ scale: 0.97 }}
    />
  );
};

export default CalendarButton;
