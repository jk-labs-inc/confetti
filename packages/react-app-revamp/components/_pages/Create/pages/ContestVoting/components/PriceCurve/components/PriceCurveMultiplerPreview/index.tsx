import CreateFlowMonetizationInput from "@components/_pages/Create/components/MonetizationInput";
import { FC } from "react";
import PriceCurveRangeDisplay from "./components/PriceCurveRangeDisplay";
import { useMultiplierCalculations } from "./hooks/useMultiplierCalculations";

interface PriceCurveMultiplierPreviewProps {
  chainUnitLabel?: string;
  onError?: (hasError: boolean) => void;
}

const PriceCurveMultiplierPreview: FC<PriceCurveMultiplierPreviewProps> = ({ chainUnitLabel = "USD", onError }) => {
  const { multipler, errorMessage, handleMultiplierChange } = useMultiplierCalculations(onError);

  return (
    <div className="flex flex-col gap-6 pl-6">
      <p className="text-[20px] text-neutral-11">what multiple would you like for your price curve?</p>
      <div className="flex flex-col gap-6">
        <CreateFlowMonetizationInput value={multipler} errorMessage={errorMessage} onChange={handleMultiplierChange} />
        <PriceCurveRangeDisplay chainUnitLabel={chainUnitLabel} />
      </div>
    </div>
  );
};

export default PriceCurveMultiplierPreview;
