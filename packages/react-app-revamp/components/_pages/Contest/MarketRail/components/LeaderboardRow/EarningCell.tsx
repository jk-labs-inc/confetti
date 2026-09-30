import PnlPill from "@components/UI/PnlPill";
import { NativePriceFormatter } from "@hooks/useNativePriceFormatter";
import { FC } from "react";

interface EarningCellProps {
  earningNative: number;
  pnlPercentage: number | null;
  formatPrice: NativePriceFormatter;
}

const EarningCell: FC<EarningCellProps> = ({ earningNative, pnlPercentage, formatPrice }) => (
  <div className="flex flex-col items-end leading-tight">
    <span className="text-[12px] wide:text-[13px] font-black tabular-nums text-neutral-11">
      {formatPrice(earningNative)}
    </span>
    <PnlPill percentage={pnlPercentage} variant="text" />
  </div>
);

export default EarningCell;
