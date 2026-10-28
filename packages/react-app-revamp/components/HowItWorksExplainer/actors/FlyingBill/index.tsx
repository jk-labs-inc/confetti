import Bill, { type BillTone } from "@components/HowItWorksExplainer/actors/Bill";
import { motion, type MotionValue } from "motion/react";
import { FC } from "react";

interface FlyingBillProps {
  label: string | MotionValue<string>;
  tone?: BillTone;
  x: MotionValue<number>;
  y: MotionValue<number>;
  rotate: MotionValue<number>;
  scale: MotionValue<number> | number;
  opacity: MotionValue<number>;
}

const FlyingBill: FC<FlyingBillProps> = ({ label, tone, x, y, rotate, scale, opacity }) => (
  <motion.div className="absolute left-0 top-0" style={{ x, y }}>
    <Bill label={label} tone={tone} style={{ left: 0, top: 0, rotate, scale, opacity }} />
  </motion.div>
);

export default FlyingBill;
