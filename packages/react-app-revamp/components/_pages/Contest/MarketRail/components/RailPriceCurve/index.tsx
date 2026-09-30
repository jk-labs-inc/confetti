import PriceCurveWrapper from "@components/PriceCurve/wrapper";
import { useParentSize } from "@visx/responsive";
import { FC } from "react";
import { RAIL_PRICE_CURVE_ASPECT_CLASS_NAME, RAIL_PRICE_CURVE_PADDING } from "../../constants";

const RESIZE_DEBOUNCE_MS = 150;

const RailPriceCurve: FC = () => {
  const { parentRef, height } = useParentSize({ debounceTime: RESIZE_DEBOUNCE_MS });

  return (
    <div ref={parentRef} className={`w-full shrink-0 ${RAIL_PRICE_CURVE_ASPECT_CLASS_NAME}`}>
      {height > 0 ? (
        <PriceCurveWrapper
          height={height}
          noPadding
          showAxisLabels
          showPriceWarning
          showVoterRibbon={false}
          headerTone="bright"
          chartPadding={RAIL_PRICE_CURVE_PADDING}
        />
      ) : null}
    </div>
  );
};

export default RailPriceCurve;
