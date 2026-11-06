/* eslint-disable @next/next/no-img-element */
import { STEP_SLIDE_DURATION_S } from "@components/HowItWorksExplainer/engine";
import StepCopy from "@components/HowItWorksExplainer/StepCopy";
import { motion, useReducedMotion } from "motion/react";
import { FC } from "react";
import type { BubblesPose, HowItWorksStep } from "lib/howItWorks/types";

interface BubblesGuideProps {
  step: HowItWorksStep;
}

const POSE_SRC: Record<BubblesPose, string> = {
  ballot: "/landing/bubbles-ballot.png",
  money: "/landing/bubbles-money.png",
  moneyPile: "/landing/bubbles-money-group.png",
  building: "/contest/bubbles-under-construction.png",
  shy: "/entry/no-votes-bubbles.png",
};

const BUBBLES_SIZE_PX = 72;
const COPY_GAP_PX = 16;
const HOP_TRANSITION = { delay: STEP_SLIDE_DURATION_S, type: "spring", bounce: 0.55, duration: 0.5 } as const;

export const GUIDE_COPY_INSET_PX = BUBBLES_SIZE_PX + COPY_GAP_PX;

const BubblesGuide: FC<BubblesGuideProps> = ({ step }) => {
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex h-full items-center" style={{ gap: COPY_GAP_PX }}>
      <motion.img
        src={POSE_SRC[step.pose]}
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
      <div className="min-w-0 flex-1">
        <StepCopy step={step} />
      </div>
    </div>
  );
};

export default BubblesGuide;
