import { ProcessedContest } from "lib/contests/types";
import { FC, useEffect, useState } from "react";
import { getContestTiming, getTimingUpdateInterval } from "../../helpers";
import { ContestTimingData, ContestTimingFormat } from "../../types";

interface ContestTimingProps {
  contest: ProcessedContest;
}

const getTextColorClass = (format: ContestTimingFormat): string => {
  if (format === "ended" || format === "canceled") return "text-neutral-10";
  return "text-neutral-11";
};

const getEmoji = (format: ContestTimingFormat): string => {
  return format === "countdown" ? "🔥" : "⏱️";
};

const ContestTiming: FC<ContestTimingProps> = ({ contest }) => {
  const [timing, setTiming] = useState<ContestTimingData | null>(() => getContestTiming(contest));

  useEffect(() => {
    const updateTiming = () => {
      setTiming(getContestTiming(contest));
    };

    updateTiming();

    const intervalTime = getTimingUpdateInterval(contest);
    const interval = setInterval(updateTiming, intervalTime);

    return () => clearInterval(interval);
  }, [contest]);

  if (!timing) return null;

  const textColorClass = getTextColorClass(timing.format);

  return (
    <div className="flex items-baseline gap-1 shrink-0">
      {/* fixed size so only the text scales when the footer shrinks to fit */}
      <span className="text-base">{getEmoji(timing.format)}</span>
      <p className={`whitespace-nowrap ${textColorClass}`}>{timing.display}</p>
    </div>
  );
};

export default ContestTiming;
