import { VotingWidgetStyle } from "@components/Voting";
import { useVotingStore } from "@components/Voting/store";
import { FC, RefObject } from "react";
import { motion } from "motion/react";
import { useShallow } from "zustand/shallow";

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
  const { inputValue, setInputValue, setIsFocused, isInvalid, handleMaxClick } = useVotingStore(
    useShallow(state => ({
      inputValue: state.inputValue,
      setInputValue: state.setInputValue,
      setIsFocused: state.setIsFocused,
      isInvalid: state.isInvalid,
      handleMaxClick: state.handleMaxClick,
    })),
  );

  const valueString = inputValue || "0.00";
  const dotCount = (valueString.match(/\./g) || []).length;
  const width = valueString.length - dotCount * 0.5;

  const hasBalance = parseFloat(maxBalance) > 0;
  const styleConfig = STYLE_CONFIG[style];
  const textColor = isInvalid ? "text-negative-11" : "text-neutral-11";
  const borderColor = isInvalid ? "border-negative-11" : "border-secondary-14";

  return (
    <div
      className={`flex w-full h-[72px] items-center justify-between px-6 text-[16px] ${styleConfig.background} font-bold ${textColor} border ${borderColor} rounded-[40px] transition-colors duration-300`}
    >
      <div className="flex items-baseline">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value, maxBalance)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="0.00"
          onKeyDown={onKeyDown}
          className="text-[40px] bg-transparent outline-none placeholder-primary-5 max-w-42 md:max-w-48"
          style={{ width: `${width || 1}ch` }}
        />
        <span className="text-[16px] text-neutral-9 whitespace-nowrap ml-2">{symbol}</span>
      </div>
      {hasBalance && (
        <motion.button
          onClick={() => handleMaxClick(maxBalance, isConnected)}
          className="w-20 h-6 bg-primary-14 rounded-[40px] text-positive-11 text-[16px] border-secondary-14 border font-bold flex items-center justify-center"
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
