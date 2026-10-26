import BackButton from "@components/HowItWorksExplainer/BackButton";
import BubblesGuide from "@components/HowItWorksExplainer/BubblesGuide";
import { STEP_SLIDE_DURATION_S, STEP_SLIDE_EASE } from "@components/HowItWorksExplainer/engine";
import SceneViewport from "@components/HowItWorksExplainer/SceneViewport";
import { SCENES } from "@components/HowItWorksExplainer/scenes";
import NextButton from "@components/HowItWorksExplainer/NextButton";
import StepCopy from "@components/HowItWorksExplainer/StepCopy";
import StepSegments from "@components/HowItWorksExplainer/StepSegments";
import { swipeToStep, useStepper, type StepDirection } from "@components/HowItWorksExplainer/stepper";
import { DEMO_SCRIPT } from "lib/howItWorks/demo";
import { HOW_IT_WORKS_STEP_COUNT, HOW_IT_WORKS_STEPS } from "lib/howItWorks/steps";
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

  const slideProps = {
    custom: stepper.direction,
    variants: slideVariants,
    initial: "enter",
    animate: "center",
    exit: "exit",
    transition: SLIDE_TRANSITION,
  };

  return (
    <div className="flex flex-col gap-6 px-6 pt-2 pb-11 lg:p-2 lg:pb-6 text-left">
      <div className="flex items-center gap-3">
        <BackButton isHidden={stepper.isFirst} onBack={stepper.back} />
        <StepSegments count={HOW_IT_WORKS_STEP_COUNT} index={stepper.index} onSelect={stepper.goTo} />
        <button
          type="button"
          onClick={onClose}
          aria-label="close how it works"
          className="flex size-8 shrink-0 translate-x-1 -translate-y-2 lg:translate-x-3 lg:-translate-y-5 items-center justify-center transition-transform hover:scale-[1.1]"
        >
          <img src="/modal/modal_close.svg" width={24} height={24} alt="" draggable={false} />
        </button>
      </div>
      <div className="relative overflow-hidden">
        <AnimatePresence mode="popLayout" custom={stepper.direction} initial={false}>
          <motion.div
            key={stepper.step.id}
            {...slideProps}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={SWIPE_ELASTIC}
            dragDirectionLock
            onDragEnd={handleDragEnd}
            className="flex flex-col gap-3 touch-pan-y"
          >
            <BubblesGuide bubbles={stepper.step.bubbles} />
            <SceneViewport>
              <Scene script={DEMO_SCRIPT} />
            </SceneViewport>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="relative grid">
        {HOW_IT_WORKS_STEPS.map((step, i) => (
          <div key={step.id} aria-hidden className="invisible col-start-1 row-start-1 flex items-center gap-4">
            <div className="flex-1">
              <StepCopy step={step} />
            </div>
            <NextButton isLast={i === HOW_IT_WORKS_STEP_COUNT - 1} onNext={stepper.next} />
          </div>
        ))}
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-4">
          <div className="relative flex-1 overflow-hidden" aria-live="polite">
            <AnimatePresence mode="popLayout" custom={stepper.direction} initial={false}>
              <motion.div key={stepper.step.id} {...slideProps}>
                <StepCopy step={stepper.step} />
              </motion.div>
            </AnimatePresence>
          </div>
          <NextButton isLast={stepper.isLast} onNext={stepper.next} />
        </div>
      </div>
    </div>
  );
};

export default HowItWorksSteps;
