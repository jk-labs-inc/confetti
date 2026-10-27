import type { StepDirection, Stepper, StepperAction, StepperState } from "@components/HowItWorksExplainer/types";
import { HOW_IT_WORKS_STEPS, HOW_IT_WORKS_STEP_COUNT } from "lib/howItWorks/steps";
import { useCallback, useEffect, useReducer } from "react";

const LAST_INDEX = HOW_IT_WORKS_STEP_COUNT - 1;

export const SWIPE_DISTANCE_PX = 56;
export const SWIPE_VELOCITY = 400;

const INITIAL_STEPPER_STATE: StepperState = { index: 0, direction: 1 };

export const stepperReducer = (state: StepperState, action: StepperAction): StepperState => {
  switch (action.kind) {
    case "next":
      return state.index >= LAST_INDEX ? state : { index: state.index + 1, direction: 1 };
    case "back":
      return state.index <= 0 ? state : { index: state.index - 1, direction: -1 };
    case "goTo": {
      const index = Math.min(LAST_INDEX, Math.max(0, action.index));
      if (index === state.index) return state;
      return { index, direction: index > state.index ? 1 : -1 };
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

export const useStepper = ({ isEnabled, onFinish }: { isEnabled: boolean; onFinish: () => void }): Stepper => {
  const [state, dispatch] = useReducer(stepperReducer, INITIAL_STEPPER_STATE);
  const isLast = state.index === LAST_INDEX;

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
    step: HOW_IT_WORKS_STEPS[state.index],
    direction: state.direction,
    isFirst: state.index === 0,
    isLast,
    next,
    back,
    goTo,
  };
};
