import { formatBalance } from "@helpers/formatBalance";
import { ArrowsUpDownIcon } from "@heroicons/react/24/outline";
import { FC } from "react";
import { InputMode, SecondaryDisplay } from "./useTokenWidget";

interface TokenAmountInputProps {
  inputValue: string;
  inputMode: InputMode;
  isMaxPressed: boolean;
  isExceedingBalance: boolean;
  secondaryDisplay: SecondaryDisplay;
  hasRate: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleMode: () => void;
}

const TokenAmountInput: FC<TokenAmountInputProps> = ({
  inputValue,
  inputMode,
  isMaxPressed,
  isExceedingBalance,
  secondaryDisplay,
  hasRate,
  onChange,
  onToggleMode,
}) => {
  const displayValue = isMaxPressed ? formatBalance(inputValue) : inputValue;

  const isUsdMode = inputMode === "usd";

  return (
    <div className="flex flex-col w-2/3">
      <div className="flex items-baseline">
        {isUsdMode ? (
          <span className={`text-[32px] ${isExceedingBalance ? "text-negative-11" : "text-neutral-11"}`}>$</span>
        ) : null}
        <input
          min={0}
          type="number"
          className={`text-[32px] placeholder-neutral-10 placeholder-bold bg-transparent border-none focus:outline-none ${
            isExceedingBalance ? "text-negative-11" : "text-neutral-11"
          }`}
          placeholder="0"
          onChange={onChange}
          value={displayValue}
          autoFocus
          aria-label={isUsdMode ? "USD amount" : "Token amount"}
        />
      </div>
      <div className="flex items-center gap-1">
        <p className="text-base font-bold text-neutral-10">
          {secondaryDisplay.prefix}
          {secondaryDisplay.value} <span className="uppercase">{secondaryDisplay.label}</span>
        </p>
        {hasRate ? (
          <button onClick={onToggleMode} aria-label="Toggle between crypto and USD input" className="cursor-pointer">
            <ArrowsUpDownIcon className="w-3 h-3 text-[#a1a1a1]" />
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default TokenAmountInput;
