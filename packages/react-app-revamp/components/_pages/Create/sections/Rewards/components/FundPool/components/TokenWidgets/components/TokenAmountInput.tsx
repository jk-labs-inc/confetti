import { useFitTextToBox } from "@components/EntryCarousel/useFitTextToBox";
import { formatBalance } from "@helpers/formatBalance";
import { ArrowsUpDownIcon } from "@heroicons/react/24/outline";
import { FC, useEffect, useRef } from "react";
import { InputMode, SecondaryDisplay } from "./useTokenWidget";

const MIN_FONT_PX = 12;
const MAX_FONT_PX = 32;

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
  const inputRef = useRef<HTMLInputElement>(null);

  const isUsdMode = inputMode === "usd";

  const valueString = displayValue || "0";
  const dotCount = (valueString.match(/\./g) || []).length;
  const charCount = valueString.length - dotCount * 0.5;
  const mirrorText = isUsdMode ? `$${valueString}` : valueString;
  const { ref: inputFitRef, fontSize } = useFitTextToBox<HTMLSpanElement>(mirrorText, MIN_FONT_PX, MAX_FONT_PX);

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div className="flex flex-col w-2/3">
      <div className="relative flex min-w-0 items-baseline overflow-hidden">
        <span
          ref={inputFitRef}
          aria-hidden="true"
          className="invisible absolute left-0 top-0 block w-full overflow-hidden whitespace-nowrap pr-2"
        >
          {mirrorText}
        </span>
        {isUsdMode ? (
          <span
            className={`transition-[font-size] duration-150 ${
              isExceedingBalance ? "text-negative-11" : "text-neutral-11"
            }`}
            style={{ fontSize: `${fontSize}px` }}
          >
            $
          </span>
        ) : null}
        <input
          ref={inputRef}
          min={0}
          type="number"
          className={`placeholder-bold bg-transparent border-none focus:outline-none min-w-0 transition-[font-size] duration-150 ${
            isExceedingBalance ? "text-negative-11" : "text-neutral-11"
          }`}
          style={{ fontSize: `${fontSize}px`, width: `${charCount || 1}ch`, maxWidth: "100%" }}
          placeholder="0"
          onChange={onChange}
          value={displayValue}
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
