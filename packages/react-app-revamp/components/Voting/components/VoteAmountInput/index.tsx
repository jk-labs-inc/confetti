import { VotingWidgetStyle } from "@components/Voting";
import { FC, RefObject } from "react";
import { motion } from "motion/react";
import Skeleton from "react-loading-skeleton";
import useVotingInputDisplay from "./hooks/useVotingInputDisplay";

interface VoteAmountInputProps {
  maxBalance: string;
  symbol: string;
  inputRef: RefObject<HTMLInputElement>;
  isConnected: boolean;
  style?: VotingWidgetStyle;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const STYLE_CONFIG = {
  colored: {
    background: "bg-secondary-13",
  },
  classic: {
    background: "bg-transparent",
  },
} as const;

const VoteAmountInput: FC<VoteAmountInputProps> = ({
  maxBalance,
  symbol,
  isConnected,
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

  const placeholder = "0.00";
  const valueString = displayValue || placeholder;
  const dotCount = (valueString.match(/\./g) || []).length;
  const width = valueString.length - dotCount * 0.5;

  const styleConfig = STYLE_CONFIG[style];
  const textColor = isInvalid ? "text-negative-11" : "text-neutral-11";
  const borderColor = isInvalid ? "border-negative-11" : "border-secondary-14";

  return (
    <div
      className={`flex w-full h-[72px] items-center justify-between px-6 text-[16px] ${styleConfig.background} font-bold ${textColor} border ${borderColor} rounded-[40px] transition-colors duration-300`}
    >
      <div className="flex items-baseline">
        {isLoading ? (
          <Skeleton width={120} height={40} baseColor="#706f78" highlightColor="#FFE25B" borderRadius={8} />
        ) : (
          <>
            {displaySymbol === "$" && (
              <span className="text-[40px] text-neutral-9 whitespace-nowrap mr-1">{displaySymbol}</span>
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
              className="text-[40px] bg-transparent outline-none placeholder-neutral-9 max-w-42 md:max-w-48"
              style={{ width: `${width || 1}ch` }}
            />
            {displaySymbol !== "$" && (
              <span className="text-[16px] text-neutral-9 whitespace-nowrap ml-2">{displaySymbol}</span>
            )}
          </>
        )}
      </div>
      <motion.button
        onClick={handleDisplayMax}
        className="w-20 h-6 bg-primary-14 rounded-[40px] text-positive-11 text-[16px] border-secondary-14 border font-bold flex items-center justify-center"
        style={{ willChange: "transform" }}
        whileTap={{ scale: 0.97 }}
      >
        max
      </motion.button>
    </div>
  );
};

export default VoteAmountInput;
