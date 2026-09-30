import { useFitTextToBox } from "@components/EntryCarousel/useFitTextToBox";
import { VotingWidgetStyle } from "@components/Voting";
import { VotingWidgetLayout } from "@components/Voting/types";
import { useVotingStore } from "@components/Voting/store";
import { formatVoteCount } from "@helpers/formatNumber";
import { MOBILE_MAX_WIDTH_PX } from "@helpers/isMobileViewport";
import useDisplayPrice from "@hooks/useCurrency/useDisplayPrice";
import { useVotesFromInput } from "@hooks/useVotesFromInput";
import { FC, RefObject } from "react";
import Skeleton from "react-loading-skeleton";
import { useMediaQuery } from "react-responsive";
import { useShallow } from "zustand/shallow";
import PresetChips from "./components/PresetChips";

interface VoteAmountInputProps {
  maxBalance: string;
  symbol: string;
  costToVote: string;
  inputRef: RefObject<HTMLInputElement>;
  isConnected: boolean;
  displayValue: string;
  displaySymbol: string;
  isDisplayLoading: boolean;
  onDisplayChange: (value: string) => void;
  onDisplayMax: () => void;
  isBelowMinimum?: boolean;
  pushToFirstAmount?: string | null;
  style?: VotingWidgetStyle;
  layout?: VotingWidgetLayout;
  autoFocus?: boolean;
  isReadOnly?: boolean;
  showPresets?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const STYLE_CONFIG = {
  muted: {
    background: "bg-neutral-2",
    borderColor: "border-neutral-5",
    placeholderColor: "placeholder-primary-3",
    chipBorderColor: "border-neutral-17",
  },
  classic: {
    background: "bg-transparent",
    borderColor: "border-secondary-11",
    placeholderColor: "placeholder-neutral-9/50",
    chipBorderColor: "border-[#84679B]",
  },
} as const;

const INPUT_MIN_FONT_PX = 12;
const MOBILE_INPUT_MAX_FONT_PX = 24;
const INPUT_MAX_FONT_PX: Record<VotingWidgetLayout, number> = {
  [VotingWidgetLayout.regular]: 40,
  [VotingWidgetLayout.compact]: 32,
};
const PILL_PADDING_CLASS_NAME: Record<VotingWidgetLayout, string> = {
  [VotingWidgetLayout.regular]: "px-6",
  [VotingWidgetLayout.compact]: "px-4",
};
const VOTES_TEXT_SIZE_CLASS_NAME: Record<VotingWidgetLayout, string> = {
  [VotingWidgetLayout.regular]: "text-[16px]",
  [VotingWidgetLayout.compact]: "text-[13px]",
};

const VoteAmountInput: FC<VoteAmountInputProps> = ({
  maxBalance,
  symbol,
  costToVote,
  isConnected,
  displayValue,
  displaySymbol,
  isDisplayLoading,
  onDisplayChange,
  onDisplayMax,
  isBelowMinimum = false,
  pushToFirstAmount,
  style = VotingWidgetStyle.classic,
  layout = VotingWidgetLayout.regular,
  autoFocus = false,
  isReadOnly = false,
  showPresets = true,
  inputRef,
  onKeyDown,
}) => {
  const { displayValue: pricePerVoteDisplay, displaySymbol: pricePerVoteSymbol } = useDisplayPrice(
    costToVote,
    symbol,
    undefined,
    undefined,
    { ceilingPrecision: true },
  );
  const formattedPricePerVote =
    pricePerVoteSymbol === "$" ? `$${pricePerVoteDisplay}` : `${pricePerVoteDisplay} ${pricePerVoteSymbol}`;
  const { inputValue, setInputValue, setSliderValue } = useVotingStore(
    useShallow(state => ({
      inputValue: state.inputValue,
      setInputValue: state.setInputValue,
      setSliderValue: state.setSliderValue,
    })),
  );
  const totalVotes = useVotesFromInput({ inputValue, costToVote });

  const handlePreset = (percent: number) => {
    if (percent === 100) {
      onDisplayMax();
    } else {
      setSliderValue(percent, maxBalance, isConnected);
    }
  };

  // Fill the raw native amount, not the display string — display can be abbreviated ("1.5m") or rate-rounded.
  const handlePushToFirst = () => {
    if (pushToFirstAmount) {
      setInputValue(pushToFirstAmount, maxBalance);
    }
  };

  // Strip digit grouping so the placeholder is always typeable as shown.
  const placeholder = (pricePerVoteDisplay || "0").replace(/,/g, "");
  const valueString = displayValue || placeholder;
  const dotCount = (valueString.match(/\./g) || []).length;
  const charCount = valueString.length - dotCount * 0.5;

  const isMobile = useMediaQuery({ maxWidth: MOBILE_MAX_WIDTH_PX });

  const mirrorText = displaySymbol === "$" ? `$${valueString}` : `${valueString} ${displaySymbol}`;
  const { ref: inputFitRef, fontSize: inputFontSize } = useFitTextToBox<HTMLSpanElement>(
    mirrorText,
    INPUT_MIN_FONT_PX,
    isMobile ? MOBILE_INPUT_MAX_FONT_PX : INPUT_MAX_FONT_PX[layout],
  );

  const hasBalance = parseFloat(maxBalance) > 0;
  const styleConfig = STYLE_CONFIG[style];
  const hasError = isBelowMinimum;
  const textColor = hasError ? "text-negative-11" : "text-neutral-11";
  const borderColor = hasError ? "border-negative-11" : styleConfig.borderColor;

  // The placeholder is only sample text, so no vote count until something is actually typed;
  // "1 vote" stays mounted invisibly as a spacer so the row height doesn't jump on first input.
  const hasInput = displayValue.length > 0;
  const votesText = formatVoteCount(hasInput ? totalVotes : 1);

  const showPercentPresets = showPresets && hasBalance && isConnected;
  const showPushToFirst = Boolean(pushToFirstAmount);
  const hasChips = showPushToFirst || showPercentPresets;
  const isCompact = layout === VotingWidgetLayout.compact;
  const presetChips = (
    <PresetChips
      layout={layout}
      chipBorderColor={styleConfig.chipBorderColor}
      showPushToFirst={showPushToFirst}
      showPercentPresets={showPercentPresets}
      onPushToFirst={handlePushToFirst}
      onPreset={handlePreset}
    />
  );

  return (
    <div className="flex flex-col gap-2">
      <div
        className={`flex w-full items-center gap-3 ${PILL_PADDING_CLASS_NAME[layout]} py-2 text-[16px] ${styleConfig.background} font-bold ${textColor} border ${borderColor} rounded-[40px] transition-colors duration-300 cursor-text`}
        onClick={() => {
          if (!isReadOnly) inputRef.current?.focus();
        }}
      >
        <div className="relative flex min-w-0 flex-1 items-baseline overflow-hidden">
          <span
            ref={inputFitRef}
            aria-hidden="true"
            className="invisible absolute left-0 top-0 block w-full overflow-hidden whitespace-nowrap pr-2"
          >
            {mirrorText}
          </span>
          {isDisplayLoading ? (
            <Skeleton width={120} height={40} baseColor="#706f78" highlightColor="#FFE25B" borderRadius={8} />
          ) : (
            <>
              {displaySymbol === "$" && (
                <span
                  className="text-neutral-9 whitespace-nowrap mr-1 transition-[font-size] duration-150"
                  style={{ fontSize: `${inputFontSize}px` }}
                >
                  {displaySymbol}
                </span>
              )}
              <input
                ref={inputRef}
                type="text"
                inputMode={isReadOnly ? "none" : "decimal"}
                readOnly={isReadOnly}
                autoFocus={autoFocus}
                value={displayValue}
                onChange={e => onDisplayChange(e.target.value)}
                placeholder={placeholder}
                onKeyDown={onKeyDown}
                className={`bg-transparent text-right outline-none ${styleConfig.placeholderColor} min-w-0 transition-[font-size] duration-150`}
                style={{ fontSize: `${inputFontSize}px`, width: `${charCount || 1}ch`, maxWidth: "100%" }}
              />
              {displaySymbol !== "$" && (
                <span className="text-[16px] text-neutral-9 whitespace-nowrap ml-2 uppercase">{displaySymbol}</span>
              )}
            </>
          )}
        </div>

        <div className="flex flex-col items-end gap-3 ml-auto shrink-0">
          {hasChips && !isCompact && presetChips}
          <span
            className={`${VOTES_TEXT_SIZE_CLASS_NAME[layout]} text-neutral-9 font-bold ${hasInput ? "" : "invisible"}`}
          >
            {votesText}
          </span>
        </div>
      </div>
      {hasChips && isCompact && presetChips}
      {isBelowMinimum && (
        <p className="text-[14px] font-bold text-negative-11 px-6">
          must be at least {formattedPricePerVote} to buy a vote
        </p>
      )}
    </div>
  );
};

export default VoteAmountInput;
