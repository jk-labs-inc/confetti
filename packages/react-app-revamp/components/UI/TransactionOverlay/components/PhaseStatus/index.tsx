import { AnimatePresence, motion } from "motion/react";
import { FC } from "react";
import { OVERLAY_TYPE_SCALE } from "../../constants";
import { getPendingPhaseCopy } from "../../copy";
import {
  TransactionOverlayFlow,
  TransactionOverlayPendingPhase,
  TransactionOverlayPlacement,
  TransactionOverlayTextSize,
} from "../../types";

interface PhaseStatusProps {
  flow: TransactionOverlayFlow;
  phase: TransactionOverlayPendingPhase;
  placement: TransactionOverlayPlacement;
  textSize: TransactionOverlayTextSize;
}

const PhaseStatus: FC<PhaseStatusProps> = ({ flow, phase, placement, textSize }) => {
  const copy = getPendingPhaseCopy(flow, phase, placement);
  const typeScale = OVERLAY_TYPE_SCALE[textSize];

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
        <p className={`font-sabo-filled ${typeScale.title} text-neutral-11`}>{copy.title}</p>
        <p className={`${typeScale.sub} text-neutral-14`}>{copy.sub}</p>
      </motion.div>
    </AnimatePresence>
  );
};

export default PhaseStatus;
