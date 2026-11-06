import { spring, transform } from "motion/react";

const POP_SPRING = spring({ keyframes: [0, 1], damping: 11, stiffness: 170, mass: 0.7 });
const SETTLE_SPRING = spring({ keyframes: [0, 1], damping: 18, stiffness: 120 });
const BUMP_PEAK_S = 0.13;
const BUMP_END_S = 0.4;

const springAt = (generator: typeof POP_SPRING, t: number, startS: number) =>
  t < startS ? 0 : generator.next((t - startS) * 1000).value;

export const popSpring = (t: number, startS: number) => springAt(POP_SPRING, t, startS);

export const settleSpring = (t: number, startS: number) => springAt(SETTLE_SPRING, t, startS);

export const clampedInterpolate = (value: number, input: number[], output: number[]) => transform(value, input, output);

export const bump = (t: number, startS: number, amount: number) =>
  clampedInterpolate(t - startS, [0, BUMP_PEAK_S, BUMP_END_S], [1, 1 + amount, 1]);

export const isWithin = (progress: number) => progress >= 0 && progress < 1;
