import BackButton from "@components/HowItWorksExplainer/BackButton";
import BubblesGuide, { GUIDE_COPY_INSET_PX } from "@components/HowItWorksExplainer/BubblesGuide";
import { STEP_SLIDE_DURATION_S, STEP_SLIDE_EASE } from "@components/HowItWorksExplainer/engine";
import SceneViewport from "@components/HowItWorksExplainer/SceneViewport";
import { SCENES } from "@components/HowItWorksExplainer/scenes";
import NextButton from "@components/HowItWorksExplainer/NextButton";
import StepCopy from "@components/HowItWorksExplainer/StepCopy";
import StepSegments from "@components/HowItWorksExplainer/StepSegments";
import { swipeToStep, useStepper } from "@components/HowItWorksExplainer/stepper";
import type { StepDirection } from "@components/HowItWorksExplainer/types";
import { useParentSize } from "@visx/responsive";
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
  const { parentRef: sceneRef, width: sceneWidth } = useParentSize({ debounceTime: 0 });
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
    <div className="flex flex-col gap-5 px-6 pt-2 pb-11 lg:p-2 lg:pb-6 text-left">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <h2 className="flex-1 font-sabo-filled text-[24px] leading-none text-neutral-11">how it works</h2>
          <BackButton isHidden={stepper.isFirst} onBack={stepper.back} />
          <NextButton isLast={stepper.isLast} onNext={stepper.next} />
        </div>
        <StepSegments count={HOW_IT_WORKS_STEP_COUNT} index={stepper.index} onSelect={stepper.goTo} />
      </div>
      <div className="relative grid overflow-hidden" aria-live="polite">
        {HOW_IT_WORKS_STEPS.map(step => (
          <div
            key={step.id}
            aria-hidden
            className="invisible col-start-1 row-start-1"
            style={{ paddingLeft: GUIDE_COPY_INSET_PX }}
          >
            <StepCopy step={step} />
          </div>
        ))}
        <AnimatePresence mode="popLayout" custom={stepper.direction} initial={false}>
          <motion.div key={stepper.step.id} {...slideProps} className="col-start-1 row-start-1">
            <BubblesGuide step={stepper.step} />
          </motion.div>
        </AnimatePresence>
      </div>
      <div ref={sceneRef} className="relative overflow-hidden">
        <AnimatePresence mode="popLayout" custom={stepper.direction} initial={false}>
          <motion.div
            key={stepper.step.id}
            {...slideProps}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={SWIPE_ELASTIC}
            dragDirectionLock
            onDragEnd={handleDragEnd}
            className="touch-pan-y"
          >
            <SceneViewport widthPx={sceneWidth}>
              <Scene script={DEMO_SCRIPT} />
            </SceneViewport>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HowItWorksSteps;
