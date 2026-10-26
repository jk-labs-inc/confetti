import type { StagePoint } from "@components/HowItWorksExplainer/arc";
import { clampedInterpolate, popSpring } from "@components/HowItWorksExplainer/clock";
import { useTransform, type MotionValue } from "motion/react";

interface BillFlightOptions {
  launchAt: number;
  flightS: number;
  leadS: number;
  swingDeg: number;
  shrink: number;
  pointAt: (progress: number) => StagePoint;
}

export const BILL_TILT_DEG = -6;
const FADE_FROM = 0.85;

export const useBillFlight = (
  time: MotionValue<number>,
  { launchAt, flightS, leadS, swingDeg, shrink, pointAt }: BillFlightOptions,
) => {
  const flight = useTransform(time, t => clampedInterpolate(t, [launchAt, launchAt + flightS], [0, 1]));
  const position = useTransform(flight, pointAt);
  const x = useTransform(position, point => point.x);
  const y = useTransform(position, point => point.y);
  const rotate = useTransform(flight, p => BILL_TILT_DEG + swingDeg * Math.sin(p * Math.PI));
  const scale = useTransform(() => Math.min(1, popSpring(time.get(), launchAt - leadS)) * (1 - shrink * flight.get()));
  const opacity = useTransform(() =>
    time.get() >= launchAt - leadS && flight.get() < 1 ? clampedInterpolate(flight.get(), [FADE_FROM, 1], [1, 0]) : 0,
  );
  return { flight, x, y, rotate, scale, opacity };
};
