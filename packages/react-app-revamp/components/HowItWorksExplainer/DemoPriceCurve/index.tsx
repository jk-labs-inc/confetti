import { STAGE_WIDTH_PX } from "@components/HowItWorksExplainer/engine";
import RealFrame from "@components/HowItWorksExplainer/RealFrame";
import PriceCurve from "@components/PriceCurve";
import { CEILING_PRECISION, formatDemoPrice } from "lib/howItWorks/display";
import type { DemoScript } from "lib/howItWorks/types";
import { FC } from "react";

interface DemoPriceCurveProps {
  script: DemoScript;
  pointIndex: number;
  heightPx: number;
}

export const CURVE_INSET_PX = 12;
const CURVE_WIDTH_PX = STAGE_WIDTH_PX - 2 * CURVE_INSET_PX;
const CURVE_POSITION = { left: CURVE_INSET_PX, top: CURVE_INSET_PX };
const CHART_PADDING = { top: 14, right: 12, bottom: 10, left: 12 };
const SECONDS_PER_POINT = 60;

const formatHeaderPrice = (price: number) => formatDemoPrice(price, CEILING_PRECISION);

const DemoPriceCurve: FC<DemoPriceCurveProps> = ({ script, pointIndex, heightPx }) => {
  const { chart } = script.curve;

  return (
    <RealFrame layoutWidthPx={CURVE_WIDTH_PX} stageWidthPx={CURVE_WIDTH_PX} style={CURVE_POSITION}>
      <PriceCurve
        data={chart}
        currentIndex={pointIndex}
        currentPrice={chart[pointIndex].pv}
        width={CURVE_WIDTH_PX}
        height={heightPx}
        noPadding
        chartPadding={CHART_PADDING}
        formatPrice={formatDemoPrice}
        formatHeaderPrice={formatHeaderPrice}
        percentageIncrease={null}
        isBelowThreshold
        secondsUntilNextUpdate={SECONDS_PER_POINT}
        votingTimeLeft={0}
        contestPhase="during"
        startPriceValue={chart[0].pv}
        endPriceValue={chart[chart.length - 1].pv}
        updateIntervalSeconds={script.contest.updateIntervalSeconds}
        showVoterRibbon={false}
        showIntervalText={false}
      />
    </RealFrame>
  );
};

export default DemoPriceCurve;
