import usePriceCurveData from "@hooks/usePriceCurveData";

export const useEffectiveCostToVote = (fallbackCostToVote: string): string => {
  const { currentPriceNative } = usePriceCurveData();
  return parseFloat(currentPriceNative) > 0 ? currentPriceNative : fallbackCostToVote;
};
