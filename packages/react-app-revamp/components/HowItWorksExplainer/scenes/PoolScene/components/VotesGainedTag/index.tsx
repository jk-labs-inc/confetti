import { clampedInterpolate, popSpring } from "@components/HowItWorksExplainer/clock";
import { formatNumberWithCommas } from "@helpers/formatNumber";
import { motion, useTransform, type MotionValue } from "motion/react";
import { FC } from "react";

interface VotesGainedTagProps {
  votes: number;
  centerX: number;
  top: number;
  time: MotionValue<number>;
  startAt: number;
}

const RISE_PX = 26;
const VISIBLE_S = [0, 0.15, 0.75, 1.05] as const;

const VotesGainedTag: FC<VotesGainedTagProps> = ({ votes, centerX, top, time, startAt }) => {
  const scale = useTransform(time, t => popSpring(t, startAt));
  const y = useTransform(time, t => -RISE_PX * clampedInterpolate(t - startAt, [0, VISIBLE_S[3]], [0, 1]));
  const opacity = useTransform(time, t => clampedInterpolate(t - startAt, [...VISIBLE_S], [0, 1, 1, 0]));

  return (
    <motion.div className="absolute -translate-x-1/2" style={{ left: centerX, top, y, scale, opacity }}>
      <span className="block whitespace-nowrap rounded-full border border-primary-10/60 bg-true-black/85 px-2 py-0.5 text-[11px] font-bold text-primary-10">
        +{formatNumberWithCommas(votes)} votes
      </span>
    </motion.div>
  );
};

export default VotesGainedTag;
