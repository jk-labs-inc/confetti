import { motion } from "motion/react";
import { FC } from "react";
import { TransactionOverlayPendingPhase, TransactionOverlayPhase, TransactionOverlayStep } from "../../types";

// each phase eases toward its ceiling; mining crawls so the bar never stalls
// visibly while waiting on block confirmations.
const PHASE_PROGRESS: Record<TransactionOverlayPendingPhase, { target: number; duration: number }> = {
  [TransactionOverlayPhase.SIGNING]: { target: 22, duration: 1.4 },
  [TransactionOverlayPhase.MINING]: { target: 82, duration: 18 },
  [TransactionOverlayPhase.INDEXING]: { target: 96, duration: 3 },
};

const getProgress = (phase: TransactionOverlayPendingPhase, steps: TransactionOverlayStep[]) => {
  if (steps.length === 0) return PHASE_PROGRESS[phase];

  const completedCount = steps.filter(step => step.status === "completed").length;
  return { target: Math.min(94, 6 + (completedCount / steps.length) * 88), duration: 0.6 };
};

interface PhaseProgressBarProps {
  phase: TransactionOverlayPendingPhase;
  steps: TransactionOverlayStep[];
}

const PhaseProgressBar: FC<PhaseProgressBarProps> = ({ phase, steps }) => {
  const { target, duration } = getProgress(phase, steps);

  return (
    <div className="h-1 w-full max-w-[280px] overflow-hidden rounded-full bg-neutral-17">
      <motion.div
        className="h-full rounded-full bg-gradient-vote"
        initial={{ width: "0%" }}
        animate={{ width: `${target}%` }}
        transition={{ duration, ease: "easeOut" }}
      />
    </div>
  );
};

export default PhaseProgressBar;
