"use client";
import { useVotingStore } from "@components/Voting/store";
import { motion } from "motion/react";
import { FC } from "react";
import { useShallow } from "zustand/shallow";

const PERCENT_PRESETS = [25, 50, 75, 100];

interface VotePercentRowProps {
  maxBalance: string;
  isConnected: boolean;
}

const VotePercentRow: FC<VotePercentRowProps> = ({ maxBalance, isConnected }) => {
  const { setSliderValue, handleMaxClick } = useVotingStore(
    useShallow(state => ({ setSliderValue: state.setSliderValue, handleMaxClick: state.handleMaxClick })),
  );

  const hasBalance = parseFloat(maxBalance) > 0;
  if (!hasBalance || !isConnected) return null;

  const handlePreset = (percent: number) => {
    if (percent === 100) {
      handleMaxClick(maxBalance, isConnected);
    } else {
      setSliderValue(percent, maxBalance, isConnected);
    }
  };

  return (
    <div className="flex items-center justify-center gap-2">
      {PERCENT_PRESETS.map(percent => {
        const isMax = percent === 100;
        return (
          <motion.button
            key={percent}
            type="button"
            onClick={() => handlePreset(percent)}
            whileTap={{ scale: 0.95 }}
            style={{ willChange: "transform" }}
            className={`flex h-8 touch-manipulation select-none items-center justify-center rounded-[40px] border border-neutral-10 px-4 text-[16px] font-bold transition-colors duration-150 hover:bg-positive-11/10 ${
              isMax ? "text-positive-11" : "text-neutral-9"
            }`}
          >
            {isMax ? "max" : `${percent}%`}
          </motion.button>
        );
      })}
    </div>
  );
};

export default VotePercentRow;
