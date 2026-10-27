import ConfettiBurst from "@components/HowItWorksExplainer/actors/ConfettiBurst";
import RewardsPot from "@components/HowItWorksExplainer/actors/RewardsPot";
import { bump, clampedInterpolate, settleSpring } from "@components/HowItWorksExplainer/clock";
import { useSceneClock } from "@components/HowItWorksExplainer/engine";
import { POT_LEFT_PX, POT_TOP_PX } from "@components/HowItWorksExplainer/scenes/potStage";
import {
  PAY_COUNT_S,
  WINNER_STAGE,
  voterRowTop,
  winnerBeats,
} from "@components/HowItWorksExplainer/scenes/WinnerScene/beats";
import PayoutBill from "@components/HowItWorksExplainer/scenes/WinnerScene/components/PayoutBill";
import WinnerCard from "@components/HowItWorksExplainer/scenes/WinnerScene/components/WinnerCard";
import WinnerVoterRow from "@components/HowItWorksExplainer/scenes/WinnerScene/components/WinnerVoterRow";
import type { SceneProps } from "@components/HowItWorksExplainer/types";
import { formatDemoDollars } from "lib/howItWorks/demo";
import { useTransform } from "motion/react";
import { FC, useMemo } from "react";

const POT_PAY_BUMP = -0.05;
const CONFETTI_ORIGIN = { x: WINNER_STAGE.voterLeft + 50, y: voterRowTop(1) };

const WinnerScene: FC<SceneProps> = ({ script }) => {
  const beats = useMemo(() => winnerBeats(script), [script]);
  const time = useSceneClock(beats);

  const moved = useTransform(time, t => settleSpring(t, beats.moveAt));
  const potX = useTransform(moved, m => WINNER_STAGE.potShiftX * m);
  const potY = useTransform(moved, m => WINNER_STAGE.potShiftY * m);
  const potScale = useTransform(
    () =>
      (1 - (1 - WINNER_STAGE.potScale) * moved.get()) *
      beats.payouts.reduce((scale, beat) => scale * bump(time.get(), beat.launchAt, POT_PAY_BUMP), 1),
  );
  const amountLabel = useTransform(time, t => {
    const paid = beats.payouts.reduce(
      (sum, beat) => sum + beat.voter.payout * clampedInterpolate(t, [beat.landAt, beat.landAt + PAY_COUNT_S], [0, 1]),
      0,
    );
    return formatDemoDollars(Math.max(0, Math.round(script.pool.final - paid)));
  });

  return (
    <>
      {script.entries.map((entry, i) => (
        <WinnerCard
          key={entry.id}
          entry={entry}
          index={i}
          isWinner={entry.id === script.winner.entryId}
          beats={beats}
          time={time}
        />
      ))}
      <RewardsPot
        time={time}
        amountLabel={amountLabel}
        layers={beats.potLayers}
        style={{ left: POT_LEFT_PX, top: POT_TOP_PX, x: potX, y: potY, scale: potScale }}
      />
      {beats.payouts.map((beat, i) => (
        <WinnerVoterRow key={beat.voter.seed} index={i} beat={beat} time={time} />
      ))}
      {beats.payouts.map((beat, i) => (
        <PayoutBill key={beat.voter.seed} index={i} beat={beat} time={time} />
      ))}
      <ConfettiBurst time={time} startS={beats.finaleAt} originX={CONFETTI_ORIGIN.x} originY={CONFETTI_ORIGIN.y} />
    </>
  );
};

export default WinnerScene;
