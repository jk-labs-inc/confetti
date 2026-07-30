"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { useShallow } from "zustand/shallow";
import AmbientParticles from "./components/AmbientParticles";
import ErrorView from "./components/ErrorView";
import PendingView from "./components/PendingView";
import SuccessView from "./components/SuccessView";
import { SUCCESS_DISMISS_MS } from "./constants";
import { txOverlay, useTransactionOverlayStore } from "./store";
import { TransactionOverlayPhase } from "./types";

const TransactionOverlay = () => {
  const { isOpen, flow, phase, errorMessage, steps, successMeta } = useTransactionOverlayStore(
    useShallow(state => state),
  );

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // warm the success mascot so it doesn't pop in late on first success
    const mascot = new window.Image();
    mascot.src = "/landing/bubbles-money.png";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || phase !== TransactionOverlayPhase.SUCCESS) return;

    const timeout = setTimeout(() => txOverlay.dismiss(), SUCCESS_DISMISS_MS);

    return () => clearTimeout(timeout);
  }, [isOpen, phase]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-10000 flex flex-col bg-true-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          role="dialog"
          aria-modal="true"
          aria-live="polite"
        >
          <div
            className="absolute inset-0 bg-[radial-gradient(55%_40%_at_50%_42%,#16101b_0%,#000000_100%)]"
            aria-hidden="true"
          />
          {phase !== TransactionOverlayPhase.ERROR && <AmbientParticles />}
          <div className="relative flex flex-1 flex-col items-center justify-center px-10 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
            {phase === TransactionOverlayPhase.ERROR ? (
              <ErrorView errorMessage={errorMessage} />
            ) : phase === TransactionOverlayPhase.SUCCESS ? (
              <SuccessView flow={flow} meta={successMeta} />
            ) : (
              <PendingView flow={flow} phase={phase} steps={steps} />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TransactionOverlay;
