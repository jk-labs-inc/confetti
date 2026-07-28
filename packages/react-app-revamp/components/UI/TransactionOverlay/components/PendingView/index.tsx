import { motion } from "motion/react";
import { FC } from "react";
import { TransactionOverlayFlow, TransactionOverlayPendingPhase, TransactionOverlayStep } from "../../types";
import ChompLoader from "../ChompLoader";
import PhaseProgressBar from "../PhaseProgressBar";
import PhaseStatus from "../PhaseStatus";
import StepList from "../StepList";

interface PendingViewProps {
  flow: TransactionOverlayFlow;
  phase: TransactionOverlayPendingPhase;
  steps: TransactionOverlayStep[];
}

const PendingView: FC<PendingViewProps> = ({ flow, phase, steps }) => (
  <div className="flex flex-col items-center gap-10">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <ChompLoader size={160} />
    </motion.div>
    <motion.div
      className="flex flex-col items-center gap-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12, duration: 0.3, ease: "easeOut" }}
    >
      <PhaseStatus flow={flow} phase={phase} />
      {steps.length > 0 && <StepList steps={steps} />}
    </motion.div>
    <motion.div
      className="flex w-full justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.24, duration: 0.3 }}
    >
      <PhaseProgressBar phase={phase} steps={steps} />
    </motion.div>
  </div>
);

export default PendingView;
