"use client";

import { motion, useAnimate } from "motion/react";
import { FC, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useShallow } from "zustand/shallow";
import OverlayScene from "../components/OverlayScene";
import { VOTE_FLOW_TRACKING_ID } from "../constants";
import { isInlineOverlayInFlow, isInlineOverlayShowing, txOverlay, useTransactionOverlayStore } from "../store";
import { TransactionOverlayFlow, TransactionOverlayPlacement } from "../types";
import { useOverlayLifecycle } from "../useOverlayLifecycle";

interface InlineTransactionOverlayProps {
  className?: string;
  inFlowClassName?: string;
}

const InlineTransactionOverlay: FC<InlineTransactionOverlayProps> = ({ className = "", inFlowClassName = "" }) => {
  const { isOpen, placement, flow, phase, errorMessage, steps, successMeta, voteShare } = useTransactionOverlayStore(
    useShallow(state => state),
  );
  const isVisible = isOpen && placement === TransactionOverlayPlacement.INLINE;
  const isInFlow = useTransactionOverlayStore(isInlineOverlayInFlow);
  const [isExiting, setIsExiting] = useState(false);
  const wasVisibleRef = useRef(false);
  const coverHeightRef = useRef<number | null>(null);
  const [scope, animate] = useAnimate<HTMLDivElement>();

  useOverlayLifecycle({ isVisible, phase, flow });

  useEffect(() => {
    if (wasVisibleRef.current && !isVisible) setIsExiting(true);
    wasVisibleRef.current = isVisible;
  }, [isVisible]);

  useEffect(
    () => () => {
      if (isInlineOverlayShowing(useTransactionOverlayStore.getState())) {
        txOverlay.dismiss();
      }
    },
    [],
  );

  useLayoutEffect(() => {
    if (!isInFlow && scope.current) coverHeightRef.current = scope.current.offsetHeight;
  });

  useLayoutEffect(() => {
    const el = scope.current;
    const from = coverHeightRef.current;
    if (!isInFlow || !el || from === null) return;

    const to = el.offsetHeight;
    if (from === to) return;

    const controls = animate(el, { height: [from, to] }, { duration: 0.4, ease: [0.22, 1, 0.36, 1] });
    controls.then(() => {
      el.style.height = "";
    });

    return () => {
      controls.stop();
      el.style.height = "";
    };
  }, [isInFlow, animate, scope]);

  if (!isVisible && !isExiting) return null;

  return (
    <motion.div
      ref={scope}
      id={flow === TransactionOverlayFlow.VOTE ? VOTE_FLOW_TRACKING_ID : undefined}
      className={`flex flex-col overflow-hidden bg-true-black ${className} ${
        isInFlow ? `relative ${inFlowClassName}` : "absolute inset-0 z-20"
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      onAnimationComplete={() => {
        if (!isVisible) setIsExiting(false);
      }}
      aria-live="polite"
    >
      <OverlayScene
        flow={flow}
        phase={phase}
        errorMessage={errorMessage}
        steps={steps}
        successMeta={successMeta}
        voteShare={voteShare}
        placement={TransactionOverlayPlacement.INLINE}
        contentClassName="px-6 py-8"
      />
    </motion.div>
  );
};

export default InlineTransactionOverlay;
