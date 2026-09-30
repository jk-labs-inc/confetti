import usePriceCurveChartStore from "@components/PriceCurve/store";
import { useEffect } from "react";
import { NextPriceUpdate } from "./index";

const PRICE_UPDATE_WARNING_WINDOW_S = 10;
const PRICE_WARNING_MIN_TIME_LEFT_S = 60;

export const usePriceUpdateWarning = (
  { secondsUntilNextUpdate, votingTimeLeft }: NextPriceUpdate,
  enabled = true,
): void => {
  const setShowPriceUpdateWarning = usePriceCurveChartStore(state => state.setShowPriceUpdateWarning);

  useEffect(() => {
    setShowPriceUpdateWarning(
      enabled &&
        secondsUntilNextUpdate < PRICE_UPDATE_WARNING_WINDOW_S &&
        votingTimeLeft > PRICE_WARNING_MIN_TIME_LEFT_S,
    );
  }, [enabled, secondsUntilNextUpdate, votingTimeLeft, setShowPriceUpdateWarning]);
};

export default usePriceUpdateWarning;
