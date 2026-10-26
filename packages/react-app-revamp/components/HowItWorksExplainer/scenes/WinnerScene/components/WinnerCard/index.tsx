import WinnerBadge from "@components/_pages/ProposalContent/components/WinnerCelebration/WinnerBadge";
import { bump, clampedInterpolate, popSpring } from "@components/HowItWorksExplainer/clock";
import DemoEntryCard from "@components/HowItWorksExplainer/DemoEntryCard";
import { useClockState } from "@components/HowItWorksExplainer/engine";
import { entryRowLeft } from "@components/HowItWorksExplainer/realProps";
import { CARD_TOP_PX } from "@components/HowItWorksExplainer/scenes/potStage";
import { DIM_S, type WinnerBeats } from "@components/HowItWorksExplainer/scenes/WinnerScene/beats";
import type { DemoEntry } from "lib/howItWorks/demo";
import { motion, useTransform, type MotionValue } from "motion/react";
import { FC } from "react";

interface WinnerCardProps {
  entry: DemoEntry;
  index: number;
  isWinner: boolean;
  beats: WinnerBeats;
  time: MotionValue<number>;
}

const RUNNER_UP_OPACITY = 0.35;
const CROWN_BUMP = 0.06;

const WinnerCard: FC<WinnerCardProps> = ({ entry, index, isWinner, beats, time }) => {
  const isCrowned = useClockState(time, t => isWinner && t >= beats.crownAt);
  const opacity = useTransform(time, t =>
    isWinner ? 1 : clampedInterpolate(t, [beats.crownAt, beats.crownAt + DIM_S], [1, RUNNER_UP_OPACITY]),
  );
  const scale = useTransform(time, t => (isWinner ? bump(t, beats.crownAt, CROWN_BUMP) : 1));
  const badgeScale = useTransform(time, t => popSpring(t, beats.crownAt));

  return (
    <DemoEntryCard
      entry={entry}
      votes={entry.votes}
      rank={entry.rank}
      isCrowned={isCrowned}
      style={{ left: entryRowLeft(index), top: CARD_TOP_PX, opacity, scale }}
    >
      {isWinner && (
        <motion.div className="absolute inset-x-0 -top-3 z-10 flex justify-center" style={{ scale: badgeScale }}>
          <WinnerBadge variant="inline" />
        </motion.div>
      )}
    </DemoEntryCard>
  );
};

export default WinnerCard;
