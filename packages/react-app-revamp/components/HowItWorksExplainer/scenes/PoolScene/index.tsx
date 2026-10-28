import ConfettiBurst from "@components/HowItWorksExplainer/actors/ConfettiBurst";
import RewardsPot from "@components/HowItWorksExplainer/actors/RewardsPot";
import { bump, clampedInterpolate, popSpring, settleSpring } from "@components/HowItWorksExplainer/clock";
import { useSceneClock } from "@components/HowItWorksExplainer/engine";
import { POT_MOUTH, liveVotesAt, poolBeats } from "@components/HowItWorksExplainer/scenes/PoolScene/beats";
import PoolCard from "@components/HowItWorksExplainer/scenes/PoolScene/components/PoolCard";
import PoolDeposit from "@components/HowItWorksExplainer/scenes/PoolScene/components/PoolDeposit";
import { POT_LEFT_PX, POT_TOP_PX } from "@components/HowItWorksExplainer/scenes/potStage";
import type { SceneProps } from "@components/HowItWorksExplainer/types";
import { formatDemoDollars } from "lib/howItWorks/demo";
import { rankByVotes } from "lib/howItWorks/rank";
import { useTransform } from "motion/react";
import { FC, useMemo } from "react";

const POOL_FILL_S = 0.9;

const PoolScene: FC<SceneProps> = ({ script }) => {
  const beats = useMemo(() => poolBeats(script), [script]);
  const entryIndex = script.entries.findIndex(entry => entry.id === script.winner.entryId);
  const time = useSceneClock(beats);

  const liveVotes = useTransform(time, t => liveVotesAt(script, beats, t));
  const liveRanks = useTransform(liveVotes, rankByVotes);
  const amountLabel = useTransform(time, t =>
    formatDemoDollars(
      Math.round(
        beats.deposits.reduce(
          (sum, beat) => sum + Math.min(1, settleSpring(t, beat.landAt)) * beat.deposit.toPool,
          script.pool.start * clampedInterpolate(t, [beats.potIntroAt, beats.potIntroAt + POOL_FILL_S], [0, 1]),
        ),
      ),
    ),
  );
  const poolIntro = useTransform(time, t => popSpring(t, beats.potIntroAt));
  const poolOpacity = useTransform(poolIntro, value => Math.min(1, value * 1.5));
  const poolY = useTransform(poolIntro, value => (1 - value) * 20);
  const poolScale = useTransform(
    time,
    t => beats.deposits.reduce((scale, beat) => scale * bump(t, beat.landAt, 0.05), 1) * bump(t, beats.finaleAt, 0.1),
  );

  return (
    <>
      <PoolCard
        entry={script.entries[entryIndex]}
        entryIndex={entryIndex}
        beats={beats}
        time={time}
        liveVotes={liveVotes}
        liveRanks={liveRanks}
      />
      <RewardsPot
        time={time}
        amountLabel={amountLabel}
        layers={beats.potLayers}
        style={{ left: POT_LEFT_PX, top: POT_TOP_PX, opacity: poolOpacity, y: poolY, scale: poolScale }}
      />
      {beats.deposits.map((beat, k) => (
        <PoolDeposit key={k} beat={beat} time={time} />
      ))}
      <ConfettiBurst time={time} startS={beats.finaleAt} originX={POT_MOUTH.x} originY={POT_MOUTH.y} />
    </>
  );
};

export default PoolScene;
