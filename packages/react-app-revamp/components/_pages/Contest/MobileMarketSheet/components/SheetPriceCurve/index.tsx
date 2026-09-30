import PriceCurveWrapper from "@components/PriceCurve/wrapper";
import { useParentSize } from "@visx/responsive";
import { FC } from "react";
import { SHEET_PRICE_CURVE_MAX_HEIGHT } from "../../constants";

const RESIZE_DEBOUNCE_MS = 150;

const SheetPriceCurve: FC = () => {
  const { parentRef, height } = useParentSize({ debounceTime: RESIZE_DEBOUNCE_MS });

  return (
    <div ref={parentRef} className="aspect-square w-full pt-1" style={{ maxHeight: SHEET_PRICE_CURVE_MAX_HEIGHT }}>
      {height > 0 ? (
        <PriceCurveWrapper height={height} noPadding showAxisLabels showPriceWarning showVoterRibbon={false} />
      ) : null}
    </div>
  );
};

export default SheetPriceCurve;
