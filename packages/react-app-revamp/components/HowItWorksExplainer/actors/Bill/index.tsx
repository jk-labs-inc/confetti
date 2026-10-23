import { CSSProperties, FC } from "react";

export type BillTone = "cash" | "fee";

interface BillProps {
  label: string;
  tone?: BillTone;
  isVisible?: boolean;
  style?: CSSProperties;
  "data-actor"?: string;
  "data-index"?: number;
}

export const BILL_HEIGHT_PX = 22;

const TONE_CLASS_NAME: Record<BillTone, string> = {
  cash: "border-[#C98579] bg-[#F7C9BE] text-[#7A3B30]",
  fee: "border-neutral-6 bg-neutral-4 text-neutral-9",
};

const Bill: FC<BillProps> = ({ label, tone = "cash", isVisible, style, ...actor }) => (
  <div
    {...actor}
    style={{ height: BILL_HEIGHT_PX, ...style }}
    className={`absolute flex -translate-x-1/2 -rotate-6 items-center whitespace-nowrap rounded-[4px] border px-1.5 text-[12px] font-bold shadow-[0_2px_0_rgba(0,0,0,0.35)] ${
      isVisible ? "" : "opacity-0"
    } ${TONE_CLASS_NAME[tone]}`}
  >
    {label}
  </div>
);

export default Bill;
