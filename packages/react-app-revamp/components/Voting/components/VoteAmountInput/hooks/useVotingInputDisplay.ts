import { useVotingStore } from "@components/Voting/store";
import { toFixedString } from "@helpers/formatBalance";
import { useCurrencyStore } from "@hooks/useCurrency/store";
import useVoteCurrencyUsdRate from "@hooks/useCurrency/useVoteCurrencyUsdRate";
import { isUsdPegged, VoteCurrency } from "lib/voteCurrency";
import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/shallow";

interface UseVotingInputDisplayProps {
  voteCurrency: VoteCurrency;
  maxBalance: string;
  isConnected: boolean;
}

interface UseVotingInputDisplayReturn {
  displayValue: string;
  displaySymbol: string;
  isLoading: boolean;
  isInvalid: boolean;
  isPrefilled: boolean;
  handleDisplayChange: (value: string) => void;
  handleDisplayMax: () => void;
  setIsFocused: (focused: boolean) => void;
}

const convertNativeToDisplay = (nativeValue: string, rate: number | undefined): string => {
  if (rate === undefined) return nativeValue;
  const num = parseFloat(nativeValue);
  if (isNaN(num) || num === 0) return nativeValue;
  const usdValue = num * rate;
  return usdValue < 1 ? toFixedString(parseFloat(usdValue.toPrecision(4))) : usdValue.toFixed(2);
};

const convertDisplayToNative = (displayValue: string, rate: number | undefined): string => {
  if (rate === undefined) return displayValue;
  const num = parseFloat(displayValue);
  if (isNaN(num) || num === 0) return displayValue;
  return toFixedString(num / rate);
};

const WHOLE_DOLLAR_DECIMALS = /\.00$/;

const displayFor = (nativeValue: string, rate: number | undefined, isPrefilled: boolean): string => {
  const value = convertNativeToDisplay(nativeValue, rate);
  return isPrefilled ? value.replace(WHOLE_DOLLAR_DECIMALS, "") : value;
};

const useVotingInputDisplay = ({
  voteCurrency,
  maxBalance,
  isConnected,
}: UseVotingInputDisplayProps): UseVotingInputDisplayReturn => {
  const displayCurrency = useCurrencyStore(state => state.displayCurrency);
  const { rate, isLoading: isRateLoading } = useVoteCurrencyUsdRate(voteCurrency);
  const prefersUsd = displayCurrency === "usd" || isUsdPegged(voteCurrency);
  const isUsd = prefersUsd && rate !== undefined;
  const usdRate = isUsd ? rate : undefined;
  const isLoading = prefersUsd && isRateLoading;

  const { inputValue, isAmountEdited, setInputValue, setIsFocused, isInvalid, handleMaxClick } = useVotingStore(
    useShallow(state => ({
      inputValue: state.inputValue,
      isAmountEdited: state.isAmountEdited,
      setInputValue: state.setInputValue,
      setIsFocused: state.setIsFocused,
      isInvalid: state.isInvalid,
      handleMaxClick: state.handleMaxClick,
    })),
  );

  const isPrefilled = !isAmountEdited && inputValue !== "";

  const [displayValue, setDisplayValue] = useState(() => displayFor(inputValue, usdRate, isPrefilled));
  const isUserInputRef = useRef(false);

  useEffect(() => {
    if (isUserInputRef.current) {
      isUserInputRef.current = false;
      return;
    }
    setDisplayValue(displayFor(inputValue, usdRate, isPrefilled));
  }, [inputValue, usdRate, isPrefilled]);

  const handleDisplayChange = (value: string) => {
    const nativeValue = convertDisplayToNative(value, usdRate);
    setDisplayValue(value);
    isUserInputRef.current = nativeValue !== inputValue;
    setInputValue(nativeValue, maxBalance);
  };

  const handleDisplayMax = () => {
    handleMaxClick(maxBalance, isConnected);
  };

  const displaySymbol = isUsd ? "$" : voteCurrency.symbol;

  return {
    displayValue,
    displaySymbol,
    isLoading,
    isInvalid,
    isPrefilled,
    handleDisplayChange,
    handleDisplayMax,
    setIsFocused,
  };
};

export default useVotingInputDisplay;
