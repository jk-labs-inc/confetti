import usePriceCurveChartData from "@hooks/usePriceCurveChartData";
import usePriceCurveConfig, { PriceCurveConfig } from "@hooks/usePriceCurveConfig";

interface UsePriceCurveDataReturn extends Omit<PriceCurveConfig, "pricePoints"> {
  currentPrice: number;
  currentPriceNative: string;
  currentIndex: number;
}

// Single source of truth for the price-curve interpolated state.
// `currentPrice` matches the value shown in the chart header.
// Underlying contract reads are deduped by wagmi's React Query cache.
const usePriceCurveData = (): UsePriceCurveDataReturn => {
  const { pricePoints, ...config } = usePriceCurveConfig();
  const { currentPrice, currentIndex } = usePriceCurveChartData({ pricePoints });

  const currentPriceNative =
    currentIndex >= 0 && currentIndex < pricePoints.length
      ? pricePoints[currentIndex].price
      : (pricePoints[0]?.price ?? "0");

  return { ...config, currentPrice, currentPriceNative, currentIndex };
};

export default usePriceCurveData;
