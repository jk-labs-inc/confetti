import { bump, popSpring } from "@components/HowItWorksExplainer/clock";
import DemoEntryCard from "@components/HowItWorksExplainer/DemoEntryCard";
import { useClockState } from "@components/HowItWorksExplainer/engine";
import type { PoolBeats } from "@components/HowItWorksExplainer/scenes/PoolScene/types";
import { CARD_LEFT_PX, CARD_SIZE_PX, CARD_TOP_PX } from "@components/HowItWorksExplainer/scenes/potStage";
import { useTransform, type MotionValue } from "motion/react";
import { FC } from "react";
import type { DemoEntry } from "lib/howItWorks/types";

interface PoolCardProps {
  entry: DemoEntry;
  entryIndex: number;
  beats: PoolBeats;
  time: MotionValue<number>;
  liveVotes: MotionValue<number[]>;
  liveRanks: MotionValue<number[]>;
}

const PRESS_LEAD_S = 0.07;
const PRESS_DEPTH = -0.08;

const PoolCard: FC<PoolCardProps> = ({ entry, entryIndex, beats, time, liveVotes, liveRanks }) => {
  const intro = useTransform(time, t => popSpring(t, 0));
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
  const votes = useClockState(liveVotes, all => all[entryIndex]);
  const rank = useClockState(liveRanks, all => all[entryIndex]);

  return (
    <DemoEntryCard
      entry={entry}
      votes={votes}
      rank={rank}
      sizePx={CARD_SIZE_PX}
      style={{ left: CARD_LEFT_PX, top: CARD_TOP_PX, opacity, y, scale }}
    />
  );
};

export default PoolCard;
