"use client";
import { AnimatePresence, motion } from "motion/react";
import { FC, useEffect } from "react";
import ReactDOM from "react-dom";

interface FocusModeScrimProps {
  isVisible: boolean;
  onDismiss: () => void;
}

const FocusModeScrim: FC<FocusModeScrimProps> = ({ isVisible, onDismiss }) => {
  useEffect(() => {
    if (!isVisible) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isVisible]);

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-40 touch-none bg-true-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={onDismiss}
        />
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default FocusModeScrim;
