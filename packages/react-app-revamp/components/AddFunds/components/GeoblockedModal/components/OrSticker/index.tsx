import { motion, useReducedMotion } from "motion/react";

const TILT_DEG = -6;
const STAMP_IN = { scale: 1.6, opacity: 0, rotate: TILT_DEG };
const STAMP_TRANSITION = { delay: 0.5, type: "spring", bounce: 0.5, duration: 0.5 } as const;

const GeoblockedOrSticker = () => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.span
      initial={reduceMotion ? false : STAMP_IN}
      animate={{ scale: 1, opacity: 1, rotate: TILT_DEG }}
      transition={STAMP_TRANSITION}
      className="relative z-10 -my-1 self-center rounded-lg bg-secondary-11 px-4 pb-[5px] pt-[7px] font-sabo-filled text-[24px] leading-none text-true-black uppercase shadow-[0_0_0_4px_var(--color-true-black)]"
    >
      or
    </motion.span>
  );
};

export default GeoblockedOrSticker;
