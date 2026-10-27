import type { DemoScript, HowItWorksStep } from "lib/howItWorks/types";

export interface StagePoint {
  x: number;
  y: number;
}

export interface SceneProps {
  script: DemoScript;
}

export interface SceneTiming {
  durationS: number;
  stillS: number;
}

export type StepDirection = 1 | -1;

export interface StepperState {
  index: number;
  direction: StepDirection;
}

export type StepperAction = { kind: "next" } | { kind: "back" } | { kind: "goTo"; index: number };

export interface Stepper {
  index: number;
  step: HowItWorksStep;
  direction: StepDirection;
  isFirst: boolean;
  isLast: boolean;
  next: () => void;
  back: () => void;
  goTo: (index: number) => void;
}
