import type { DemoScript } from "lib/howItWorks/demo";
import {
  useAnimate,
  useReducedMotion,
  type AnimationPlaybackControlsWithThen,
  type AnimationSequence,
} from "motion/react";
import { CSSProperties, useEffect, useRef } from "react";

export interface SceneProps {
  script: DemoScript;
}

export const STAGE_WIDTH_PX = 320;
export const STAGE_HEIGHT_PX = 216;
export const STAGE_STYLE: CSSProperties = { width: STAGE_WIDTH_PX, height: STAGE_HEIGHT_PX };

export const STEP_SLIDE_DURATION_S = 0.28;
export const STEP_SLIDE_EASE = [0.22, 1, 0.36, 1] as const;
export const SCENE_START_DELAY_S = STEP_SLIDE_DURATION_S;
export const SCENE_HOLD_MS = 1600;
export const SCENE_DEFAULT_TRANSITION = { duration: 0.45, ease: STEP_SLIDE_EASE };

export const defineActors = <const K extends readonly string[]>(_names: K) => ({
  attr: (name: K[number], index?: number) => ({ "data-actor": name, "data-index": index }),
  sel: (name: K[number], index?: number): string =>
    index === undefined ? `[data-actor="${name}"]` : `[data-actor="${name}"][data-index="${index}"]`,
});

export const useScene = <T extends Element = HTMLDivElement>(build: () => AnimationSequence) => {
  const [scope, animate] = useAnimate<T>();
  const reduceMotion = useReducedMotion();
  const buildRef = useRef(build);
  buildRef.current = build;

  useEffect(() => {
    const timeline = buildRef.current();
    if (!timeline.length) return;

    if (reduceMotion) {
      const still = animate(timeline, { skipAnimations: true });
      return () => still.stop();
    }

    let isDisposed = false;
    let holdTimer: number | undefined;
    let controls: AnimationPlaybackControlsWithThen | undefined;

    const run = (delay: number) => {
      controls = animate(timeline, { delay, defaultTransition: SCENE_DEFAULT_TRANSITION });
      controls.then(() => {
        if (!isDisposed) holdTimer = window.setTimeout(() => run(0), SCENE_HOLD_MS);
      });
    };

    run(SCENE_START_DELAY_S);

    return () => {
      isDisposed = true;
      window.clearTimeout(holdTimer);
      controls?.stop();
    };
  }, [animate, reduceMotion]);

  return scope;
};
