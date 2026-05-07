import { PriceCurveType } from "@hooks/useDeployContest/types";
import { generatePricePointsForType } from "lib/priceCurve";
import { PricePoint } from "lib/priceCurve/types";
import { useMemo } from "react";

interface UsePriceCurvePointsParams {
  startPrice: number;
  multiple: number;
  // Timestamps in ms — taking primitives keeps the memo stable without forcing callers to memoize Dates.
  startTimeMs: number;
  endTimeMs: number;
  updateIntervalSeconds?: number;
  priceCurveType?: PriceCurveType;
  enabled?: boolean;
}

interface PriceCurvePointsResult {
  pricePoints: PricePoint[];
  isLoading: boolean;
  isError: boolean;
}

const usePriceCurvePoints = ({
  startPrice,
  multiple,
  startTimeMs,
  endTimeMs,
  updateIntervalSeconds = 60,
  priceCurveType = PriceCurveType.Exponential,
  enabled = true,
}: UsePriceCurvePointsParams): PriceCurvePointsResult => {
  const pricePointsData = useMemo(() => {
    if (!enabled || !startPrice || !multiple || !startTimeMs || !endTimeMs) {
      return {
        pricePoints: [],
        isLoading: false,
        isError: false,
      };
    }

    try {
      const pricePoints = generatePricePointsForType(priceCurveType, {
        startPrice,
        multiple,
        startTime: new Date(startTimeMs),
        endTime: new Date(endTimeMs),
        updateIntervalSeconds,
      });

      return {
        pricePoints: pricePoints || [],
        isLoading: false,
        isError: false,
      };
    } catch (error) {
      console.error("Error generating price points:", error);
      return {
        pricePoints: [],
        isLoading: false,
        isError: true,
      };
    }
  }, [enabled, startPrice, multiple, startTimeMs, endTimeMs, updateIntervalSeconds, priceCurveType]);

  return pricePointsData;
};

export default usePriceCurvePoints;
