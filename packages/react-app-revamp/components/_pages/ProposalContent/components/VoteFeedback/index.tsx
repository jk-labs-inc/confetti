import { motion, useAnimationControls, useReducedMotion } from "motion/react";
import type { TargetAndTransition, Transition } from "motion/react";
import { FC, useEffect } from "react";
import { VoteCountPulseProps } from "./types";
import { useVoteIncrease } from "./useVoteIncrease";

const POP_TARGET: TargetAndTransition = { scale: [1, 1.25, 1] };
const POP_TRANSITION: Transition = { duration: 0.42, ease: "easeOut", times: [0, 0.35, 1] };

const VoteCountPulse: FC<VoteCountPulseProps> = ({ votes, children }) => {
  const increaseId = useVoteIncrease(votes)?.id ?? null;
  const reduceMotion = useReducedMotion();
  const controls = useAnimationControls();

  useEffect(() => {
    if (increaseId === null || reduceMotion) return;
    void controls.start(POP_TARGET, POP_TRANSITION);
  }, [increaseId, reduceMotion, controls]);

  return (
    <motion.span className="inline-block" animate={controls}>
      {children}
    </motion.span>
  );
};

export default VoteCountPulse;
