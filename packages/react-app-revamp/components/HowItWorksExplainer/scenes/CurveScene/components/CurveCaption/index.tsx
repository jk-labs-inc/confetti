import { formatNumberWithCommas } from "@helpers/formatNumber";
import { formatDemoDollars } from "lib/howItWorks/demo";
import type { DemoCurveBuy } from "lib/howItWorks/types";
import { motion, type MotionStyle } from "motion/react";
import { FC } from "react";

interface CurveCaptionProps {
  buy: DemoCurveBuy;
  style?: MotionStyle;
}

const CurveCaption: FC<CurveCaptionProps> = ({ buy, style }) => (
  <motion.p style={style} className="absolute inset-x-0 text-center text-[13px] font-bold text-neutral-9">
    {formatDemoDollars(buy.spend)} buys{" "}
    <span className="text-[18px] text-neutral-11">{formatNumberWithCommas(buy.votes)}</span> votes
  </motion.p>
);

export default CurveCaption;
