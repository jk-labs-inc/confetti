import type { StepDirection, Stepper, StepperAction, StepperState } from "@components/HowItWorksExplainer/types";
import type { HowItWorksStep } from "lib/howItWorks/types";
import { useCallback, useEffect, useReducer } from "react";

export const SWIPE_DISTANCE_PX = 56;
export const SWIPE_VELOCITY = 400;

const initialStepperState = (stepCount: number): StepperState => ({ index: 0, direction: 1, lastIndex: stepCount - 1 });

export const stepperReducer = (state: StepperState, action: StepperAction): StepperState => {
  switch (action.kind) {
    case "next":
      return state.index >= state.lastIndex ? state : { ...state, index: state.index + 1, direction: 1 };
    case "back":
      return state.index <= 0 ? state : { ...state, index: state.index - 1, direction: -1 };
    case "goTo": {
      const index = Math.min(state.lastIndex, Math.max(0, action.index));
      if (index === state.index) return state;
      return { ...state, index, direction: index > state.index ? 1 : -1 };
    }
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
};

export const swipeToStep = (offsetX: number, velocityX: number): StepDirection | null => {
  if (offsetX <= -SWIPE_DISTANCE_PX || velocityX <= -SWIPE_VELOCITY) return 1;
  if (offsetX >= SWIPE_DISTANCE_PX || velocityX >= SWIPE_VELOCITY) return -1;
  return null;
};

export const useStepper = ({
  steps,
  isEnabled,
  onFinish,
}: {
  steps: readonly HowItWorksStep[];
  isEnabled: boolean;
  onFinish: () => void;
}): Stepper => {
  const [state, dispatch] = useReducer(stepperReducer, steps.length, initialStepperState);
  const isLast = state.index === state.lastIndex;

  const next = useCallback(() => {
    if (isLast) onFinish();
    else dispatch({ kind: "next" });
  }, [isLast, onFinish]);
  const back = useCallback(() => dispatch({ kind: "back" }), []);
  const goTo = useCallback((index: number) => dispatch({ kind: "goTo", index }), []);

  useEffect(() => {
    if (!isEnabled) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" && !isLast) next();
      if (event.key === "ArrowLeft") back();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isEnabled, isLast, next, back]);

  return {
    index: state.index,
    step: steps[state.index],
    direction: state.direction,
    isFirst: state.index === 0,
    isLast,
    next,
    back,
    goTo,
  };
};
