import { clampedInterpolate } from "@components/HowItWorksExplainer/clock";
import type { StagePoint } from "@components/HowItWorksExplainer/types";
import { motion, useTransform, type MotionValue } from "motion/react";
import { FC } from "react";

interface TapRingProps {
  at: StagePoint;
  time: MotionValue<number>;
  pressAt: number;
}

const RING_SIZE_PX = 24;
const PRESS_LEAD_S = 0.18;
const RING_S = 0.5;

const TapRing: FC<TapRingProps> = ({ at, time, pressAt }) => {
  const dotScale = useTransform(time, t =>
    clampedInterpolate(t - pressAt, [-PRESS_LEAD_S, 0, RING_S * 0.6], [0.4, 0.8, 0.8]),
  );
  const dotOpacity = useTransform(time, t =>
    clampedInterpolate(t - pressAt, [-PRESS_LEAD_S - 0.01, -PRESS_LEAD_S, 0, RING_S * 0.6], [0, 0.5, 0.5, 0]),
  );
  const ringScale = useTransform(time, t => clampedInterpolate(t - pressAt, [0, RING_S], [0.6, 1.8]));
  const ringOpacity = useTransform(time, t => clampedInterpolate(t - pressAt, [-0.01, 0, RING_S], [0, 1, 0]));
  const position = {
    left: at.x - RING_SIZE_PX / 2,
    top: at.y - RING_SIZE_PX / 2,
    width: RING_SIZE_PX,
    height: RING_SIZE_PX,
  };

  return (
    <>
      <motion.span
        className="absolute rounded-full bg-neutral-11"
        style={{ ...position, scale: dotScale, opacity: dotOpacity }}
      />
      <motion.span
        className="absolute rounded-full border-2 border-positive-11"
        style={{ ...position, scale: ringScale, opacity: ringOpacity }}
      />
    </>
  );
};

export default TapRing;
