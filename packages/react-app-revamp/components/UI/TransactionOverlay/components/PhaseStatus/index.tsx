import { AnimatePresence, motion } from "motion/react";
import { FC } from "react";
import { getPendingPhaseCopy } from "../../copy";
import { TransactionOverlayFlow, TransactionOverlayPendingPhase } from "../../types";

interface PhaseStatusProps {
  flow: TransactionOverlayFlow;
  phase: TransactionOverlayPendingPhase;
}

const PhaseStatus: FC<PhaseStatusProps> = ({ flow, phase }) => {
  const copy = getPendingPhaseCopy(flow, phase);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={copy.title + copy.sub}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="flex flex-col items-center gap-3 text-center"
      >
        <p className="font-sabo-filled text-[20px] text-neutral-11">{copy.title}</p>
        <p className="text-[14px] text-neutral-14">{copy.sub}</p>
      </motion.div>
    </AnimatePresence>
  );
};

export default PhaseStatus;
