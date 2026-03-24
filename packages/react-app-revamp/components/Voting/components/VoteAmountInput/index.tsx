import { VotingWidgetStyle } from "@components/Voting";
import { useVotingStore } from "@components/Voting/store";
import { formatNumberWithCommas } from "@helpers/formatNumber";
import { useVotesFromInput } from "@hooks/useVotesFromInput";
import { FC, RefObject } from "react";
import { motion } from "motion/react";
import Skeleton from "react-loading-skeleton";
import { useShallow } from "zustand/shallow";
import useVotingInputDisplay from "./hooks/useVotingInputDisplay";

interface VoteAmountInputProps {
  maxBalance: string;
  symbol: string;
  costToVote: string;
  inputRef: RefObject<HTMLInputElement>;
  isConnected: boolean;
  isBelowMinimum?: boolean;
  style?: VotingWidgetStyle;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const STYLE_CONFIG = {
  colored: {
    background: "bg-[#40096A]",
    borderColor: "border-[#84679B]",
  },
  classic: {
    background: "bg-transparent",
    borderColor: "border-secondary-14",
  },
} as const;

const VoteAmountInput: FC<VoteAmountInputProps> = ({
  maxBalance,
  symbol,
  costToVote,
  isConnected,
  isBelowMinimum = false,
  style = VotingWidgetStyle.classic,
  inputRef,
  onKeyDown,
}) => {
  const { displayValue, displaySymbol, isLoading, isInvalid, handleDisplayChange, handleDisplayMax, setIsFocused } =
    useVotingInputDisplay({
      nativeCurrencySymbol: symbol,
      maxBalance,
      isConnected,
    });
  const { inputValue, setSliderValue } = useVotingStore(
    useShallow(state => ({
      inputValue: state.inputValue,
      setSliderValue: state.setSliderValue,
    })),
  );
  const totalVotes = useVotesFromInput({ inputValue, costToVote });

  const handlePreset = (percent: number) => {
    if (percent === 100) {
      handleDisplayMax();
    } else {
      setSliderValue(percent, maxBalance, isConnected);
    }
  };

  const placeholder = "0";
  const valueString = displayValue || placeholder;
  const dotCount = (valueString.match(/\./g) || []).length;
  const charCount = valueString.length - dotCount * 0.5;

  const hasBalance = parseFloat(maxBalance) > 0;
  const styleConfig = STYLE_CONFIG[style];
  const hasError = isConnected && (isInvalid || isBelowMinimum);
  const textColor = hasError ? "text-negative-11" : "text-neutral-11";
  const borderColor = hasError ? "border-negative-11" : styleConfig.borderColor;

  const votesText = `${formatNumberWithCommas(totalVotes)} ${totalVotes === 1 ? "vote" : "votes"}`;

  const showPresets = hasBalance && isConnected;

  return (
    <div
      className={`flex w-full items-center px-6 py-2 text-[16px] ${styleConfig.background} font-bold ${textColor} border ${borderColor} rounded-[40px] transition-colors duration-300`}
    >
      <div className="flex min-w-0 flex-1 items-baseline overflow-hidden">
        {isLoading ? (
          <Skeleton width={120} height={40} baseColor="#706f78" highlightColor="#FFE25B" borderRadius={8} />
        ) : (
          <>
            {displaySymbol === "$" && (
              <span className="text-[28px] md:text-[40px] text-neutral-9 whitespace-nowrap mr-1">{displaySymbol}</span>
            )}
            <input
              ref={inputRef}
              type="text"
              value={displayValue}
              onChange={e => handleDisplayChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              onKeyDown={onKeyDown}
              className="text-[28px] md:text-[40px] bg-transparent outline-none placeholder-neutral-9 min-w-0"
              style={{ width: `${charCount || 1}ch`, maxWidth: "70%" }}
            />
            {displaySymbol !== "$" && (
              <span className="text-[16px] text-neutral-9 whitespace-nowrap ml-2 uppercase">{displaySymbol}</span>
            )}
          </>
        )}
      </div>

      <div className="flex flex-col items-end gap-3 ml-auto shrink-0">
        {showPresets && (
          <div className="flex items-center gap-1">
            {[25, 50, 75, 100].map(percent => {
              const isMax = percent === 100;
              return (
                <motion.button
                  key={percent}
                  onClick={() => handlePreset(percent)}
                  className={`w-8 h-4 px-2 rounded-[40px] border border-[#84679B] font-bold flex items-center justify-center hover:bg-positive-11/10 transition-colors duration-150 ${isMax ? "text-positive-11" : "text-neutral-9"}`}
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
        )}
        <span className="text-[16px] text-neutral-9 font-bold">{votesText}</span>
      </div>
    </div>
  );
};

export default VoteAmountInput;
