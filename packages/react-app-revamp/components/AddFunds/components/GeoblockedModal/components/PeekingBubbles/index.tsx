/* eslint-disable @next/next/no-img-element */
import { motion, useReducedMotion } from "motion/react";

const SHY_BUBBLES_SRC = "/entry/no-votes-bubbles.png";
const BUBBLES_SIZE_PX = 96;
const PEEK_HEIGHT_PX = 56;
const CLIP_BELOW_LEDGE = "inset(-48px -16px 0 -16px)";
const POP_UP_TRANSITION = { delay: 0.3, type: "spring", bounce: 0.45, duration: 0.7 } as const;

const PeekingBubbles = () => {
  const reduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="shrink-0"
      style={{ width: BUBBLES_SIZE_PX, height: PEEK_HEIGHT_PX, clipPath: CLIP_BELOW_LEDGE }}
    >
      <motion.div
        initial={reduceMotion ? false : { y: PEEK_HEIGHT_PX }}
        animate={{ y: 0 }}
        transition={POP_UP_TRANSITION}
      >
        <img
          src={SHY_BUBBLES_SRC}
          alt=""
          draggable={false}
          width={BUBBLES_SIZE_PX}
          height={BUBBLES_SIZE_PX}
          className="empty-stage-sway max-w-none select-none object-contain"
          style={{ width: BUBBLES_SIZE_PX, height: BUBBLES_SIZE_PX }}
        />
      </motion.div>
    </div>
  );
};

export default PeekingBubbles;
