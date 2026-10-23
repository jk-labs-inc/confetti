import { formatDemoDollars } from "lib/howItWorks/demo";
import { motion, useTransform, type MotionValue } from "motion/react";
import { CSSProperties, FC } from "react";

interface RewardsPoolProps {
  amount: MotionValue<number>;
  style?: CSSProperties;
  fillActor: { "data-actor": string; "data-index"?: number };
  "data-actor"?: string;
  "data-index"?: number;
}

export const REWARDS_POOL_WIDTH_PX = 160;
export const REWARDS_POOL_HEIGHT_PX = 64;

const RewardsPool: FC<RewardsPoolProps> = ({ amount, style, fillActor, ...actor }) => {
  const label = useTransform(amount, value => formatDemoDollars(Math.round(value)));

  return (
    <div
      {...actor}
      style={{ width: REWARDS_POOL_WIDTH_PX, height: REWARDS_POOL_HEIGHT_PX, ...style }}
      className="absolute overflow-hidden rounded-[20px] border-2 border-primary-10/50 bg-neutral-2"
    >
      <div
        {...fillActor}
        className="absolute inset-0 origin-bottom bg-primary-10/20"
        style={{ transform: "scaleY(0)" }}
      />
      <div className="relative flex h-full flex-col items-center justify-center">
        <span className="text-[11px] font-bold text-neutral-9">rewards pool</span>
        <motion.span className="text-[26px] font-bold leading-none text-primary-10">{label}</motion.span>
      </div>
    </div>
  );
};

export default RewardsPool;
