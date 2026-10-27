/* eslint-disable @next/next/no-img-element */
import { STEP_SLIDE_DURATION_S } from "@components/HowItWorksExplainer/engine";
import SpeechBubble from "@components/HowItWorksExplainer/SpeechBubble";
import { motion, useReducedMotion } from "motion/react";
import { FC } from "react";
import type { BubblesLine, BubblesPose } from "lib/howItWorks/types";

interface BubblesGuideProps {
  bubbles: BubblesLine;
}

const POSE_SRC: Record<BubblesPose, string> = {
  ballot: "/landing/bubbles-ballot.png",
  money: "/landing/bubbles-money.png",
  moneyPile: "/landing/bubbles-money-group.png",
  building: "/contest/bubbles-under-construction.png",
  shy: "/entry/no-votes-bubbles.png",
};

const BUBBLES_SIZE_PX = 72;
const HOP_TRANSITION = { delay: STEP_SLIDE_DURATION_S, type: "spring", bounce: 0.55, duration: 0.5 } as const;

const BubblesGuide: FC<BubblesGuideProps> = ({ bubbles }) => {
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex items-center gap-4">
      <motion.img
        src={POSE_SRC[bubbles.pose]}
        alt=""
        draggable={false}
        width={BUBBLES_SIZE_PX}
        height={BUBBLES_SIZE_PX}
        className="shrink-0 select-none object-contain"
        style={{ width: BUBBLES_SIZE_PX, height: BUBBLES_SIZE_PX }}
        initial={reduceMotion ? false : { scale: 0.6, y: 12, rotate: -8 }}
        animate={{ scale: 1, y: 0, rotate: 0 }}
        transition={HOP_TRANSITION}
      />
      <SpeechBubble line={bubbles.line} isTyping={!reduceMotion} />
    </div>
  );
};

export default BubblesGuide;
