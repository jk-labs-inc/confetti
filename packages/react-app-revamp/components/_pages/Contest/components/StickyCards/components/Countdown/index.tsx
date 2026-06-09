import { useContestStore } from "@hooks/useContest/store";
import { FC, useMemo } from "react";
import { useMediaQuery } from "react-responsive";
import ContestCountdownTimeUnit from "./components/TimeUnit";

interface ContestCountdownProps {
  votingTimeLeft: number;
}

const formatDuration = (totalSeconds: number) => {
  const days = Math.floor(totalSeconds / (24 * 60 * 60));
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
};

const pluralizeLabel = (count: number, singular: string, plural: string) => {
  return count === 1 ? singular : plural;
};

const ContestCountdown: FC<ContestCountdownProps> = ({ votingTimeLeft }) => {
  const { submissionsOpen, votesOpen, votesClose } = useContestStore(state => state);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  // Determine current phase based on voting time left and dates
  const { phase, timeLeft } = useMemo(() => {
    const now = new Date();

    if (now < submissionsOpen) {
      // Calculate time to submissions
      const timeToSubmissions = Math.max(0, Math.floor((submissionsOpen.getTime() - now.getTime()) / 1000));
      return { phase: "start", timeLeft: timeToSubmissions };
    } else if (now < votesOpen) {
      // Calculate time to voting
      const timeToVoting = Math.max(0, Math.floor((votesOpen.getTime() - now.getTime()) / 1000));
      return { phase: "submit", timeLeft: timeToVoting };
    } else if (now < votesClose) {
      // Use the passed voting time left for consistency
      return { phase: "vote", timeLeft: votingTimeLeft };
    } else {
      return { phase: "ended", timeLeft: 0 };
    }
  }, [submissionsOpen, votesOpen, votesClose, votingTimeLeft]);

  const duration = formatDuration(timeLeft);

  const displayTime = () => {
    const elements = [];
    const dayLabel = isMobile ? "d " : pluralizeLabel(duration.days, " day ", " days ");
    const hourLabel = isMobile ? "h " : pluralizeLabel(duration.hours, " hr ", " hrs ");
    const minuteLabel = isMobile ? "m " : pluralizeLabel(duration.minutes, " min ", " mins ");
    const secondLabel = isMobile ? "s " : pluralizeLabel(duration.seconds, " sec ", " secs ");

    const showDays = duration.days > 0;
    const showHours = showDays || duration.hours > 0;
    const showMinutes = showHours || duration.minutes > 0;

    if (showDays)
      elements.push(<ContestCountdownTimeUnit key={`${duration.days}-days`} value={duration.days} label={dayLabel} />);
    if (showHours)
      elements.push(
        <ContestCountdownTimeUnit key={`${duration.hours}-hours`} value={duration.hours} label={hourLabel} />,
      );
    if (showMinutes)
      elements.push(
        <ContestCountdownTimeUnit key={`${duration.minutes}-minutes`} value={duration.minutes} label={minuteLabel} />,
      );
    elements.push(
      <ContestCountdownTimeUnit key={`${duration.seconds}-seconds`} value={duration.seconds} label={secondLabel} />,
    );

    return elements;
  };

  const displayText = (phase: string) => {
    switch (phase) {
      case "start":
        return "Contest opens in";
      case "submit":
        return "voting opens in";
      case "vote":
        return "Deadline to vote";
      case "ended":
        return "Contest ended";
      default:
        return "";
    }
  };

  if (phase === "ended") {
    return (
      <div className="w-full flex flex-col gap-2 md:gap-4 border-r-primary-2 border-r-2 pr-3">
        <div className="flex gap-2">
          <img src="/contest/timer.svg" width={16} height={16} alt="timer" />
          <p className="text-[12px] md:text-[16px] font-bold text-neutral-9">Contest ended</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-2 md:gap-4 border-r-primary-2 border-r-2 pr-3">
      <div className="flex gap-2">
        <img src="/contest/timer.svg" width={16} height={16} alt="timer" />
        <p className="text-[12px] md:text-[16px] font-bold text-neutral-9">{displayText(phase)}</p>
      </div>
      <div className="flex items-center">
        <span className={`font-bold ${phase === "start" ? "text-neutral-9" : "text-neutral-11"} text-neutral-11`}>
          {displayTime()}
        </span>
      </div>
    </div>
  );
};

export default ContestCountdown;
