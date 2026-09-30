import CompactAmount from "@components/UI/CompactAmount";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { motion } from "motion/react";
import { FC } from "react";
import { HEADER_HEIGHT } from "../../constants";
import InfoButton from "../InfoButton";
import { HEADER_TONE_CLASS_NAMES, PriceCurveHeaderTone } from "./constants";

interface PriceCurveHeaderProps {
  headerPrice: string;
  intervalText: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  tone?: PriceCurveHeaderTone;
}

const PriceCurveHeader: FC<PriceCurveHeaderProps> = ({
  headerPrice,
  intervalText,
  isExpanded,
  onToggleExpand,
  tone = "muted",
}) => {
  const hasToggle = typeof onToggleExpand === "function";
  const classNames = HEADER_TONE_CLASS_NAMES[tone];

  return (
    <div style={{ minHeight: HEADER_HEIGHT }}>
      <div className="flex justify-between items-start gap-2">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={classNames.priceLine}>
              <span className={classNames.amount}>
                <CompactAmount value={headerPrice} />
              </span>{" "}
              per vote
            </span>
            <InfoButton />
          </div>
          <span className={classNames.interval}>{intervalText}</span>
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
