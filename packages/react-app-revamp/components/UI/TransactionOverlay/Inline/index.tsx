"use client";

import { AnimatePresence, motion } from "motion/react";
import { FC, useEffect } from "react";
import { useShallow } from "zustand/shallow";
import OverlayScene from "../components/OverlayScene";
import { VOTE_FLOW_TRACKING_ID } from "../constants";
import { isInlineOverlayShowing, txOverlay, useTransactionOverlayStore } from "../store";
import { TransactionOverlayFlow, TransactionOverlayPlacement } from "../types";
import { useOverlayLifecycle } from "../useOverlayLifecycle";

interface InlineTransactionOverlayProps {
  className?: string;
}

const InlineTransactionOverlay: FC<InlineTransactionOverlayProps> = ({ className = "" }) => {
  const { isOpen, placement, flow, phase, errorMessage, steps, successMeta } = useTransactionOverlayStore(
    useShallow(state => state),
  );
  const isVisible = isOpen && placement === TransactionOverlayPlacement.INLINE;

  useOverlayLifecycle(isVisible, phase);

  useEffect(
    () => () => {
      if (isInlineOverlayShowing(useTransactionOverlayStore.getState())) {
        txOverlay.dismiss();
      }
    },
    [],
  );

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          id={flow === TransactionOverlayFlow.VOTE ? VOTE_FLOW_TRACKING_ID : undefined}
          className={`absolute inset-0 z-20 flex flex-col overflow-hidden bg-true-black ${className}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          aria-live="polite"
        >
          <OverlayScene
            flow={flow}
            phase={phase}
            errorMessage={errorMessage}
            steps={steps}
            successMeta={successMeta}
            placement={TransactionOverlayPlacement.INLINE}
            contentClassName="px-6 py-8"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InlineTransactionOverlay;
