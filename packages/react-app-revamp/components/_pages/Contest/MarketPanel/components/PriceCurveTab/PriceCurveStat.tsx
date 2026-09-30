import CompactAmount from "@components/UI/CompactAmount";
import { formatPnlPercentage } from "@helpers/percentages";
import { NativePriceFormatter } from "@hooks/useNativePriceFormatter";
import { FC } from "react";
import { PriceCurveStatData } from "./priceCurveStats";

interface PriceCurveStatProps {
  stat: PriceCurveStatData;
  formatPrice: NativePriceFormatter;
}

const PriceCurveStat: FC<PriceCurveStatProps> = ({ stat, formatPrice }) => (
  <div className="flex flex-col gap-0.5 leading-tight">
    <span
      className={`text-[28px] font-black tabular-nums ${stat.kind === "rise" ? "text-positive-11" : "text-neutral-11"}`}
    >
      {stat.kind === "rise" ? formatPnlPercentage(stat.value) : <CompactAmount value={formatPrice(stat.value)} />}
    </span>
    <span className="text-[12px] normal-case text-neutral-9">{stat.label}</span>
  </div>
);

export default PriceCurveStat;
