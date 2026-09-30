import { VotingWidgetLayout } from "@components/Voting/types";
import { motion } from "motion/react";
import { FC } from "react";

interface PresetChipsProps {
  layout: VotingWidgetLayout;
  chipBorderColor: string;
  showPushToFirst: boolean;
  showPercentPresets: boolean;
  onPushToFirst: () => void;
  onPreset: (percent: number) => void;
}

interface PresetChipsClassNames {
  row: string;
  chip: string;
  pushChip: string;
}

const PERCENT_PRESETS = [25, 50, 75, 100];
const MAX_PERCENT = 100;

const LAYOUT_CLASS_NAMES: Record<VotingWidgetLayout, PresetChipsClassNames> = {
  [VotingWidgetLayout.regular]: {
    row: "flex items-center gap-1",
    chip: "w-8 h-4 px-2",
    pushChip: "w-auto h-4 px-2",
  },
  [VotingWidgetLayout.compact]: {
    row: "flex w-full items-center gap-1.5",
    chip: "flex-1 h-6 px-1",
    pushChip: "shrink-0 h-6 px-2.5",
  },
};

const PresetChips: FC<PresetChipsProps> = ({
  layout,
  chipBorderColor,
  showPushToFirst,
  showPercentPresets,
  onPushToFirst,
  onPreset,
}) => {
  const classNames = LAYOUT_CLASS_NAMES[layout];

  return (
    <div className={classNames.row}>
      {showPushToFirst && (
        <motion.button
          onClick={e => {
            e.stopPropagation();
            onPushToFirst();
          }}
          className={`${classNames.pushChip} rounded-[40px] border ${chipBorderColor} text-positive-11 font-bold flex items-center justify-center hover:bg-positive-11/10 transition-colors duration-150`}
          style={{ willChange: "transform" }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-[12px] whitespace-nowrap">push to 1st</span>
        </motion.button>
      )}
      {showPercentPresets &&
        PERCENT_PRESETS.map(percent => {
          const isMax = percent === MAX_PERCENT;
          return (
            <motion.button
              key={percent}
              onClick={e => {
                e.stopPropagation();
                onPreset(percent);
              }}
              className={`${classNames.chip} rounded-[40px] border ${chipBorderColor} font-bold flex items-center justify-center hover:bg-positive-11/10 transition-colors duration-150 ${isMax ? "text-positive-11" : "text-neutral-9"}`}
              style={{ willChange: "transform" }}
              whileTap={{ scale: 0.95 }}
            >
              {isMax ? (
                <span className="text-[12px]">max</span>
              ) : (
                <>
                  <span className="text-[12px]">{percent}</span>
                  <span className="text-[10px]">%</span>
                </>
              )}
            </motion.button>
          );
        })}
    </div>
  );
};

export default PresetChips;
