import BubblesGuide from "@components/HowItWorksExplainer/BubblesGuide";
import { STEP_SLIDE_DURATION_S, STEP_SLIDE_EASE } from "@components/HowItWorksExplainer/engine";
import SceneViewport from "@components/HowItWorksExplainer/SceneViewport";
import { SCENES } from "@components/HowItWorksExplainer/scenes";
import StepControls from "@components/HowItWorksExplainer/StepControls";
import StepSegments from "@components/HowItWorksExplainer/StepSegments";
import { swipeToStep, useStepper, type StepDirection } from "@components/HowItWorksExplainer/stepper";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { DEMO_SCRIPT } from "lib/howItWorks/demo";
import { HOW_IT_WORKS_STEP_COUNT } from "lib/howItWorks/steps";
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "motion/react";
import { FC } from "react";

interface HowItWorksStepsProps {
  isOpen: boolean;
  onClose: () => void;
}

const SLIDE_OFFSET_PX = 40;
const SWIPE_ELASTIC = 0.18;
const SLIDE_TRANSITION = { duration: STEP_SLIDE_DURATION_S, ease: STEP_SLIDE_EASE };

const HowItWorksSteps: FC<HowItWorksStepsProps> = ({ isOpen, onClose }) => {
  const stepper = useStepper({ isEnabled: isOpen, onFinish: onClose });
  const reduceMotion = useReducedMotion();
  const slideOffset = reduceMotion ? 0 : SLIDE_OFFSET_PX;
  const Scene = SCENES[stepper.step.id];

  const slideVariants = {
    enter: (direction: StepDirection) => ({ x: direction * slideOffset, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: StepDirection) => ({ x: direction * -slideOffset, opacity: 0 }),
  };

  const handleDragEnd = (_: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    const direction = swipeToStep(info.offset.x, info.velocity.x);
    if (direction === 1 && !stepper.isLast) stepper.next();
    if (direction === -1) stepper.back();
  };

  return (
    <div className="flex flex-col gap-6 px-6 pt-2 pb-8 lg:p-2 text-left">
      <div className="flex items-center gap-4">
        <StepSegments count={HOW_IT_WORKS_STEP_COUNT} index={stepper.index} onSelect={stepper.goTo} />
        <button
          type="button"
          onClick={onClose}
          aria-label="close how it works"
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-neutral-9 transition-colors hover:text-neutral-11"
        >
          <XMarkIcon className="size-5" />
        </button>
      </div>
      <div className="relative overflow-hidden">
        <AnimatePresence mode="popLayout" custom={stepper.direction} initial={false}>
          <motion.div
            key={stepper.step.id}
            custom={stepper.direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={SLIDE_TRANSITION}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={SWIPE_ELASTIC}
            dragDirectionLock
            onDragEnd={handleDragEnd}
            className="flex flex-col gap-6 touch-pan-y"
          >
            <div className="flex flex-col gap-3">
              <BubblesGuide bubbles={stepper.step.bubbles} />
              <SceneViewport>
                <Scene script={DEMO_SCRIPT} />
              </SceneViewport>
            </div>
            <div className="flex min-h-[88px] flex-col gap-1" aria-live="polite">
              <p className="text-[20px] font-bold text-neutral-11">{stepper.step.headline}</p>
              <p className="text-[16px] text-neutral-9">{stepper.step.body}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <StepControls isFirst={stepper.isFirst} isLast={stepper.isLast} onBack={stepper.back} onNext={stepper.next} />
    </div>
  );
};

export default HowItWorksSteps;
