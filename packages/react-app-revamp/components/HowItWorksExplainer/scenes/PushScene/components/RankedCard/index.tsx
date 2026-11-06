import { bump } from "@components/HowItWorksExplainer/clock";
import DemoEntryCard from "@components/HowItWorksExplainer/DemoEntryCard";
import { ENTRY_CARD_SIZE_PX, entryCardLeft } from "@components/HowItWorksExplainer/realProps";
import { useTransform, type MotionValue } from "motion/react";
import { FC } from "react";
import type { DemoEntry } from "lib/howItWorks/types";

interface RankedCardProps {
  entry: DemoEntry;
  votes: number;
  rank: number;
  time: MotionValue<number>;
  climbAt: number;
  topPx: number;
}

const HIGHLIGHT_COLOR = "var(--color-primary-10)";
const CLIMB_BUMP = 0.08;
const CARD_LEFT_PX = entryCardLeft(ENTRY_CARD_SIZE_PX);

const RankedCard: FC<RankedCardProps> = ({ entry, votes, rank, time, climbAt, topPx }) => {
  const scale = useTransform(time, t => bump(t, climbAt, CLIMB_BUMP));

  return (
    <DemoEntryCard
      entry={entry}
      votes={votes}
      rank={rank}
      sizePx={ENTRY_CARD_SIZE_PX}
      highlightColor={HIGHLIGHT_COLOR}
      style={{ left: CARD_LEFT_PX, top: topPx, scale }}
    />
  );
};

export default RankedCard;
