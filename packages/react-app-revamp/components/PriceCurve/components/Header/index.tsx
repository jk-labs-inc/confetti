import { FC } from "react";
import { HEADER_HEIGHT } from "../../constants";

interface PriceCurveHeaderProps {
  headerPrice: string;
  intervalText: string;
}

const PriceCurveHeader: FC<PriceCurveHeaderProps> = ({ headerPrice, intervalText }) => {
  return (
    <div style={{ minHeight: HEADER_HEIGHT }}>
      <div className="flex justify-between items-baseline">
        <span className="text-[16px] text-neutral-9 tracking-wide">{headerPrice} per vote</span>
      </div>
      <div className="flex justify-between items-baseline mt-0.5">
        <span className="text-[12px] text-neutral-9">{intervalText}</span>
      </div>
    </div>
  );
};

export default PriceCurveHeader;
