"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { useShallow } from "zustand/shallow";
import OverlayScene from "./components/OverlayScene";
import { VOTE_FLOW_TRACKING_ID } from "./constants";
import { useTransactionOverlayStore } from "./store";
import { TransactionOverlayFlow, TransactionOverlayPlacement } from "./types";
import { useOverlayLifecycle } from "./useOverlayLifecycle";

const TransactionOverlay = () => {
  const { isOpen, placement, flow, phase, errorMessage, steps, successMeta, voteShare } = useTransactionOverlayStore(
    useShallow(state => state),
  );
  const isVisible = isOpen && placement === TransactionOverlayPlacement.FULLSCREEN;

  useEffect(() => {
    if (!isVisible) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isVisible]);

  useOverlayLifecycle({ isVisible, phase, flow });

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          id={flow === TransactionOverlayFlow.VOTE ? VOTE_FLOW_TRACKING_ID : undefined}
          className="fixed inset-0 z-10000 flex flex-col bg-true-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          role="dialog"
          aria-modal="true"
          aria-live="polite"
        >
          <OverlayScene
            flow={flow}
            phase={phase}
            errorMessage={errorMessage}
            steps={steps}
            successMeta={successMeta}
            voteShare={voteShare}
            placement={TransactionOverlayPlacement.FULLSCREEN}
            contentClassName="px-6 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TransactionOverlay;
