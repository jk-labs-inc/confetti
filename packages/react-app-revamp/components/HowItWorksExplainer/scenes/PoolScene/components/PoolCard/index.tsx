import { bump, popSpring } from "@components/HowItWorksExplainer/clock";
import DemoEntryCard from "@components/HowItWorksExplainer/DemoEntryCard";
import { useClockState } from "@components/HowItWorksExplainer/engine";
import { entryRowLeft } from "@components/HowItWorksExplainer/realProps";
import { CARD_STAGGER_S } from "@components/HowItWorksExplainer/scenes/PoolScene/beats";
import type { PoolBeats } from "@components/HowItWorksExplainer/scenes/PoolScene/types";
import { CARD_TOP_PX } from "@components/HowItWorksExplainer/scenes/potStage";
import { useTransform, type MotionValue } from "motion/react";
import { FC } from "react";
import type { DemoEntry } from "lib/howItWorks/types";

interface PoolCardProps {
  entry: DemoEntry;
  index: number;
  beats: PoolBeats;
  time: MotionValue<number>;
  liveVotes: MotionValue<number[]>;
  liveRanks: MotionValue<number[]>;
}

const PRESS_LEAD_S = 0.07;
const PRESS_DEPTH = -0.08;

const PoolCard: FC<PoolCardProps> = ({ entry, index, beats, time, liveVotes, liveRanks }) => {
  const intro = useTransform(time, t => popSpring(t, index * CARD_STAGGER_S));
  const press = useTransform(time, t =>
    beats.deposits.reduce(
      (scale, beat) =>
        beat.deposit.entryId === entry.id ? scale * bump(t, beat.launchAt - PRESS_LEAD_S, PRESS_DEPTH) : scale,
      1,
    ),
  );
  const opacity = useTransform(intro, value => Math.min(1, value * 1.5));
  const y = useTransform(intro, value => (1 - value) * -24);
  const scale = useTransform(() => (0.85 + 0.15 * intro.get()) * press.get());
  const votes = useClockState(liveVotes, all => all[index]);
  const rank = useClockState(liveRanks, all => all[index]);

  return (
    <DemoEntryCard
      entry={entry}
      votes={votes}
      rank={rank}
      style={{ left: entryRowLeft(index), top: CARD_TOP_PX, opacity, y, scale }}
    />
  );
};

export default PoolCard;
