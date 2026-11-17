import PriceCurveWrapper from "@components/PriceCurve/wrapper";
import { FC } from "react";

interface PreVotePriceCurveProps {
  id: string;
}

const PRICE_CURVE_HEIGHT_PX = 240;

const PreVotePriceCurve: FC<PreVotePriceCurveProps> = ({ id }) => (
  <div id={id} className="rounded-2xl border border-neutral-3 bg-[#0C0C0C] px-[18px] pb-3.5 pt-4">
    <PriceCurveWrapper height={PRICE_CURVE_HEIGHT_PX} noPadding showAxisLabels />
  </div>
);

export default PreVotePriceCurve;
