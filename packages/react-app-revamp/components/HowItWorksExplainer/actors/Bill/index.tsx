import { motion, type MotionStyle, type MotionValue } from "motion/react";
import { FC } from "react";

export type BillTone = "cash" | "fee";

interface BillProps {
  label: string | MotionValue<string>;
  tone?: BillTone;
  style?: MotionStyle;
}

const BILL_HEIGHT_PX = 22;

const TONE_CLASS_NAME: Record<BillTone, string> = {
  cash: "border-[#C98579] bg-[#F7C9BE] text-[#7A3B30]",
  fee: "border-neutral-6 bg-neutral-4 text-neutral-9",
};

const Bill: FC<BillProps> = ({ label, tone = "cash", style }) => (
  <motion.div
    style={{ height: BILL_HEIGHT_PX, ...style }}
    className={`absolute flex -translate-x-1/2 items-center whitespace-nowrap rounded-[4px] border px-1.5 text-[12px] font-bold shadow-[0_2px_0_rgba(0,0,0,0.35)] ${TONE_CLASS_NAME[tone]}`}
  >
    {label}
  </motion.div>
);

export default Bill;
