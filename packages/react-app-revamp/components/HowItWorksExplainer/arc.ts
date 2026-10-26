import { cubicBezier } from "motion/react";

export const flightEase = cubicBezier(0.45, 0, 0.55, 1);

export interface StagePoint {
  x: number;
  y: number;
}

export const arcPoint = (start: StagePoint, control: StagePoint, end: StagePoint, t: number): StagePoint => {
  const u = 1 - t;
  return {
    x: u * u * start.x + 2 * u * t * control.x + t * t * end.x,
    y: u * u * start.y + 2 * u * t * control.y + t * t * end.y,
  };
};
