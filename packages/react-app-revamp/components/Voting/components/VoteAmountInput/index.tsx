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
    background: "bg-secondary-13",
  },
  classic: {
    background: "bg-transparent",
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
  const inputValue = useVotingStore(useShallow(state => state.inputValue));
  const totalVotes = useVotesFromInput({ inputValue, costToVote });

  const placeholder = "0";
  const valueString = displayValue || placeholder;
  const dotCount = (valueString.match(/\./g) || []).length;
  const charCount = valueString.length - dotCount * 0.5;

  const hasBalance = parseFloat(maxBalance) > 0;
  const styleConfig = STYLE_CONFIG[style];
  const hasError = isConnected && (isInvalid || isBelowMinimum);
  const textColor = hasError ? "text-negative-11" : "text-neutral-11";
  const borderColor = hasError ? "border-negative-11" : "border-secondary-14";

  const votesText = totalVotes > 0
    ? `${formatNumberWithCommas(totalVotes)} ${totalVotes === 1 ? "vote" : "votes"}`
    : null;

  return (
    <div
      className={`flex w-full items-center justify-between px-6 py-2 text-[16px] ${styleConfig.background} font-bold ${textColor} border ${borderColor} rounded-[40px] transition-colors duration-300`}
    >
      <div className="flex min-w-0 flex-1 items-baseline">
        {isLoading ? (
          <Skeleton width={120} height={40} baseColor="#706f78" highlightColor="#FFE25B" borderRadius={8} />
        ) : (
          <>
            {displaySymbol === "$" && (
              <span className="text-[28px] md:text-[40px] text-neutral-9 whitespace-nowrap mr-1">{displaySymbol}</span>
            )}
            <div className="flex flex-col min-w-0">
              <div className="flex items-baseline">
                <input
                  ref={inputRef}
                  type="text"
                  value={displayValue}
                  onChange={e => handleDisplayChange(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder={placeholder}
                  onKeyDown={onKeyDown}
                  className="text-[28px] md:text-[40px] bg-transparent outline-none placeholder-neutral-9 min-w-0 max-w-full"
                  style={{ width: `${charCount || 1}ch` }}
                />
                {displaySymbol !== "$" && (
                  <span className="text-[16px] text-neutral-9 whitespace-nowrap ml-2 uppercase">{displaySymbol}</span>
                )}
              </div>
              {votesText && (
                <span className="text-[11px] text-neutral-9 font-normal -mt-0.5 pl-0.5">{votesText}</span>
              )}
            </div>
          </>
        )}
      </div>
      {hasBalance && (
        <motion.button
          onClick={() => handleDisplayMax()}
          className="w-20 h-6 bg-primary-14 rounded-[40px] text-positive-11 text-[16px] border-secondary-14 border font-bold flex items-center justify-center shrink-0 ml-2"
          style={{ willChange: "transform" }}
          whileTap={{ scale: 0.97 }}
        >
          max
        </motion.button>
      )}
    </div>
  );
};

export default VoteAmountInput;
