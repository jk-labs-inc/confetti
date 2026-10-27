import type { SceneTiming } from "@components/HowItWorksExplainer/types";
import { animate, useMotionValue, useReducedMotion, useTransform, type MotionValue } from "motion/react";
import { CSSProperties, useEffect, useState } from "react";

export const STAGE_WIDTH_PX = 320;
export const STAGE_HEIGHT_PX = 248;
export const STAGE_STYLE: CSSProperties = { width: STAGE_WIDTH_PX, height: STAGE_HEIGHT_PX };

export const STEP_SLIDE_DURATION_S = 0.28;
export const STEP_SLIDE_EASE = [0.22, 1, 0.36, 1] as const;

export const useSceneClock = ({ durationS, stillS }: SceneTiming): MotionValue<number> => {
  const reduceMotion = useReducedMotion();
  const time = useMotionValue(reduceMotion ? stillS : 0);

  useEffect(() => {
    if (reduceMotion) {
      time.set(stillS);
      return;
    }
    const controls = animate(time, [0, durationS], {
      duration: durationS,
      ease: "linear",
      repeat: Infinity,
      delay: STEP_SLIDE_DURATION_S,
    });
    return () => controls.stop();
  }, [time, durationS, stillS, reduceMotion]);

  return time;
};

export const useClockState = <S, T>(source: MotionValue<S>, at: (value: S) => T): T => {
  const value = useTransform(source, at);
  const [state, setState] = useState<T>(() => value.get());
  useEffect(() => {
    setState(() => value.get());
    return value.on("change", latest => setState(() => latest));
  }, [value]);
  return state;
};
