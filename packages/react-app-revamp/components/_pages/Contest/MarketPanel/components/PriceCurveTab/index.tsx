import { useContestStatusStore } from "@hooks/useContestStatus/store";
import { useNativePriceFormatter } from "@hooks/useNativePriceFormatter";
import usePriceCurveData from "@hooks/usePriceCurveData";
import { FC } from "react";
import CompactCurve from "../../../MarketRail/components/CompactCurve";
import { COMPACT_CURVE_LABEL_GUTTER_PX } from "../../../MarketRail/constants";
import { PANEL_CURVE_HEIGHT_CLASS_NAME, PANEL_CURVE_SQUARE_PX } from "../../constants";
import PriceCurveStat from "./PriceCurveStat";
import { buildPriceCurveStats } from "./priceCurveStats";

const PriceCurveTab: FC = () => {
  const { chartData, currentPrice, currentIndex, isLoading, isError } = usePriceCurveData();
  const contestStatus = useContestStatusStore(state => state.contestStatus);
  const formatPrice = useNativePriceFormatter();

  if (isError || (!isLoading && chartData.length === 0)) return null;

  const stats = isLoading
    ? []
    : buildPriceCurveStats({
        contestStatus,
        openPrice: chartData[0].pv,
        currentPrice,
        closePrice: chartData[chartData.length - 1].pv,
      });

  return (
    <div className="flex items-center gap-8">
      <div className="shrink-0" style={{ width: PANEL_CURVE_SQUARE_PX + COMPACT_CURVE_LABEL_GUTTER_PX }}>
        <CompactCurve
          chartData={chartData}
          currentPrice={currentPrice}
          currentIndex={currentIndex}
          isLoading={isLoading}
          heightClassName={PANEL_CURVE_HEIGHT_CLASS_NAME}
        />
      </div>
      <div className="flex min-w-0 flex-col gap-4">
        {stats.map(stat => (
          <PriceCurveStat key={stat.label} stat={stat} formatPrice={formatPrice} />
        ))}
      </div>
    </div>
  );
};

export default PriceCurveTab;
