import { MotionProps, Transition, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const ENTRANCE_FROM = { opacity: 0, y: 14, scale: 0.985 };
const ENTRANCE_TO = { opacity: 1, y: 0, scale: 1 };
const ENTRANCE_EASE: Transition["ease"] = [0.16, 1, 0.3, 1];
const ENTRANCE_DURATION_S = 0.55;
const ENTRANCE_STAGGER_S = 0.06;
const MAX_STAGGER_STEPS = 8;
const REORDER_ANIMATION_DELAY_MS = 1500;

export const REORDER_TRANSITION: Transition = { duration: 0.4, ease: "easeInOut" };

const SETTLED_MOTION: MotionProps = {
  initial: false,
  animate: ENTRANCE_TO,
  transition: { layout: REORDER_TRANSITION },
};

export const useEntryEntrance = (proposals: { id: string }[]) => {
  const enteredIdsRef = useRef(new Set<string>());
  const [isReorderAnimated, setIsReorderAnimated] = useState(false);
  const reduceMotion = useReducedMotion();
  const hasEntries = proposals.length > 0;

  useEffect(() => {
    for (const proposal of proposals) enteredIdsRef.current.add(proposal.id);
  }, [proposals]);

  useEffect(() => {
    if (!hasEntries || isReorderAnimated) return;
    const timer = setTimeout(() => setIsReorderAnimated(true), REORDER_ANIMATION_DELAY_MS);
    return () => clearTimeout(timer);
  }, [hasEntries, isReorderAnimated]);

  let staggerStep = 0;
  const entranceFor = (proposalId: string): MotionProps => {
    if (reduceMotion || enteredIdsRef.current.has(proposalId)) return SETTLED_MOTION;
    const delay = Math.min(staggerStep++, MAX_STAGGER_STEPS) * ENTRANCE_STAGGER_S;
    return {
      initial: ENTRANCE_FROM,
      animate: ENTRANCE_TO,
      transition: { duration: ENTRANCE_DURATION_S, ease: ENTRANCE_EASE, delay, layout: REORDER_TRANSITION },
    };
  };

  return { entranceFor, isReorderAnimated };
};
