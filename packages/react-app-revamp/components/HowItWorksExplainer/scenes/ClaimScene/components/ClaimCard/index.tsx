import { bump, popSpring } from "@components/HowItWorksExplainer/clock";
import DemoEntryCard from "@components/HowItWorksExplainer/DemoEntryCard";
import { useClockState } from "@components/HowItWorksExplainer/engine";
import { CLAIM_BEATS } from "@components/HowItWorksExplainer/scenes/ClaimScene/beats";
import { CARD_LEFT_PX, CARD_SIZE_PX, CARD_TOP_PX } from "@components/HowItWorksExplainer/scenes/potStage";
import type { DemoEntry } from "lib/howItWorks/types";
import { useTransform, type MotionValue } from "motion/react";
import { FC } from "react";

interface ClaimCardProps {
  entry: DemoEntry;
  claimedVotes: number;
  time: MotionValue<number>;
}

const LAND_POP = 0.06;

const ClaimCard: FC<ClaimCardProps> = ({ entry, claimedVotes, time }) => {
  const intro = useTransform(time, t => popSpring(t, 0));
  const opacity = useTransform(intro, value => Math.min(1, value * 1.5));
  const y = useTransform(intro, value => (1 - value) * -24);
  const scale = useTransform(() => (0.85 + 0.15 * intro.get()) * bump(time.get(), CLAIM_BEATS.landAt, LAND_POP));
  const votes = useClockState(time, t => entry.startVotes + (t >= CLAIM_BEATS.landAt ? claimedVotes : 0));

  return (
    <DemoEntryCard
      entry={entry}
      votes={votes}
      rank={entry.rank}
      sizePx={CARD_SIZE_PX}
      style={{ left: CARD_LEFT_PX, top: CARD_TOP_PX, opacity, y, scale }}
    />
  );
};

export default ClaimCard;
