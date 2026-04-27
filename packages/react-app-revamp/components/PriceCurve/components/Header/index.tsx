import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { motion } from "motion/react";
import { FC } from "react";
import { HEADER_HEIGHT } from "../../constants";
import InfoButton from "../InfoButton";

interface PriceCurveHeaderProps {
  headerPrice: string;
  intervalText: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const PriceCurveHeader: FC<PriceCurveHeaderProps> = ({ headerPrice, intervalText, isExpanded, onToggleExpand }) => {
  const hasToggle = typeof onToggleExpand === "function";

  return (
    <div style={{ minHeight: HEADER_HEIGHT }}>
      <div className="flex justify-between items-start gap-2">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-[16px] text-neutral-9 tracking-wide">{headerPrice} per vote</span>
            <InfoButton />
          </div>
          <span className="text-[12px] text-neutral-9 mt-0.5">{intervalText}</span>
        </div>
        {hasToggle && (
          <button
            type="button"
            onClick={onToggleExpand}
            aria-label={isExpanded ? "collapse price curve" : "expand price curve"}
            className="flex items-center justify-center self-center text-neutral-9 hover:text-neutral-11 transition-colors"
          >
            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2, ease: "easeInOut" }}>
              <ChevronDownIcon className="w-5 h-5" />
            </motion.div>
          </button>
        )}
      </div>
    </div>
  );
};

export default PriceCurveHeader;
