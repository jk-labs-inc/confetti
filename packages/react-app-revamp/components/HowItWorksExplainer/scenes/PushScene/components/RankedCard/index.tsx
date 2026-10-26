import { settleSpring } from "@components/HowItWorksExplainer/clock";
import DemoEntryCard from "@components/HowItWorksExplainer/DemoEntryCard";
import type { DemoEntry } from "lib/howItWorks/demo";
import { useTransform, type MotionValue } from "motion/react";
import { FC } from "react";

interface RankedCardProps {
  entry: DemoEntry;
  votes: number;
  rank: number;
  time: MotionValue<number>;
  fromLeftPx: number;
  toLeftPx: number;
  moveAt: number;
  topPx: number;
  isHighlighted: boolean;
}

const HIGHLIGHT_COLOR = "var(--color-primary-10)";

const RankedCard: FC<RankedCardProps> = ({
  entry,
  votes,
  rank,
  time,
  fromLeftPx,
  toLeftPx,
  moveAt,
  topPx,
  isHighlighted,
}) => {
  const x = useTransform(time, t => fromLeftPx + (toLeftPx - fromLeftPx) * settleSpring(t, moveAt));

  return (
    <DemoEntryCard
      entry={entry}
      votes={votes}
      rank={rank}
      highlightColor={isHighlighted ? HIGHLIGHT_COLOR : undefined}
      style={{ left: 0, top: topPx, x }}
    />
  );
};

export default RankedCard;
