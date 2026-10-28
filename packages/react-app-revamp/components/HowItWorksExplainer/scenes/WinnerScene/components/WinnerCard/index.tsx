import WinnerBadge from "@components/_pages/ProposalContent/components/WinnerCelebration/WinnerBadge";
import { bump, popSpring } from "@components/HowItWorksExplainer/clock";
import DemoEntryCard from "@components/HowItWorksExplainer/DemoEntryCard";
import { useClockState } from "@components/HowItWorksExplainer/engine";
import { CARD_LEFT_PX, CARD_SIZE_PX, CARD_TOP_PX } from "@components/HowItWorksExplainer/scenes/potStage";
import type { WinnerBeats } from "@components/HowItWorksExplainer/scenes/WinnerScene/types";
import { motion, useTransform, type MotionValue } from "motion/react";
import { FC } from "react";
import type { DemoEntry } from "lib/howItWorks/types";

interface WinnerCardProps {
  entry: DemoEntry;
  beats: WinnerBeats;
  time: MotionValue<number>;
}

const CROWN_BUMP = 0.06;

const WinnerCard: FC<WinnerCardProps> = ({ entry, beats, time }) => {
  const isCrowned = useClockState(time, t => t >= beats.crownAt);
  const scale = useTransform(time, t => bump(t, beats.crownAt, CROWN_BUMP));
  const badgeScale = useTransform(time, t => popSpring(t, beats.crownAt));

  return (
    <DemoEntryCard
      entry={entry}
      votes={entry.votes}
      rank={entry.rank}
      sizePx={CARD_SIZE_PX}
      isCrowned={isCrowned}
      style={{ left: CARD_LEFT_PX, top: CARD_TOP_PX, scale }}
    >
      <motion.div className="absolute inset-x-0 -top-3 z-10 flex justify-center" style={{ scale: badgeScale }}>
        <WinnerBadge variant="inline" />
      </motion.div>
    </DemoEntryCard>
  );
};

export default WinnerCard;
