import PixelArrow from "@components/HowItWorksExplainer/PixelArrow";
import { STEP_SLIDE_DURATION_S, STEP_SLIDE_EASE } from "@components/HowItWorksExplainer/engine";
import { motion } from "motion/react";
import { FC } from "react";

interface NextButtonProps {
  isLast: boolean;
  onNext: () => void;
}

const PRESSED = { scale: 0.96 };
const MORPH_TRANSITION = { layout: { duration: STEP_SLIDE_DURATION_S, ease: STEP_SLIDE_EASE } };

const NextButton: FC<NextButtonProps> = ({ isLast, onNext }) => (
  <motion.button
    layout
    layoutDependency={isLast}
    type="button"
    onClick={onNext}
    aria-label={isLast ? undefined : "next"}
    transition={MORPH_TRANSITION}
    whileTap={PRESSED}
    style={{ borderRadius: 999 }}
    className={`group flex h-14 shrink-0 items-center justify-center bg-gradient-purple text-true-black ${
      isLast ? "px-6" : "w-14"
    }`}
  >
    {isLast ? (
      <motion.span layout="position" layoutDependency={isLast} className="whitespace-nowrap text-[20px] font-bold">
        let&apos;s play
      </motion.span>
    ) : (
      <motion.span layout="position" layoutDependency={isLast}>
        <span className="block transition-transform group-hover:translate-x-0.5">
          <PixelArrow direction="right" sizePx={22} />
        </span>
      </motion.span>
    )}
  </motion.button>
);

export default NextButton;
