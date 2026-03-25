import { useVotingStore } from "@components/Voting/store";
import { toFixedString } from "@helpers/formatBalance";
import { useCurrencyStore } from "@hooks/useCurrency/store";
import useNativeRates from "@hooks/useCurrency/useNativeRates";
import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/shallow";

interface UseVotingInputDisplayProps {
  nativeCurrencySymbol: string;
  maxBalance: string;
  isConnected: boolean;
}

interface UseVotingInputDisplayReturn {
  displayValue: string;
  displaySymbol: string;
  isLoading: boolean;
  isInvalid: boolean;
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

const useVotingInputDisplay = ({
  nativeCurrencySymbol,
  maxBalance,
  isConnected,
}: UseVotingInputDisplayProps): UseVotingInputDisplayReturn => {
  const displayCurrency = useCurrencyStore(state => state.displayCurrency);
  const { data: nativeRates, isLoading: isNativeRatesLoading } = useNativeRates();
  const rate = nativeRates?.[nativeCurrencySymbol.toLowerCase()];
  const isUsd = displayCurrency === "usd" && rate !== undefined;
  const usdRate = isUsd ? rate : undefined;
  const isLoading = displayCurrency === "usd" && isNativeRatesLoading;

  const { inputValue, setInputValue, setIsFocused, isInvalid, handleMaxClick } = useVotingStore(
    useShallow(state => ({
      inputValue: state.inputValue,
      setInputValue: state.setInputValue,
      setIsFocused: state.setIsFocused,
      isInvalid: state.isInvalid,
      handleMaxClick: state.handleMaxClick,
    })),
  );

  const [displayValue, setDisplayValue] = useState(() => convertNativeToDisplay(inputValue, usdRate));
  const isUserInputRef = useRef(false);

  useEffect(() => {
    if (isUserInputRef.current) {
      isUserInputRef.current = false;
      return;
    }
    setDisplayValue(convertNativeToDisplay(inputValue, usdRate));
  }, [inputValue, usdRate]);

  const handleDisplayChange = (value: string) => {
    setDisplayValue(value);
    isUserInputRef.current = true;
    setInputValue(convertDisplayToNative(value, usdRate), maxBalance);
  };

  const handleDisplayMax = () => {
    handleMaxClick(maxBalance, isConnected);
  };

  const displaySymbol = isUsd ? "$" : nativeCurrencySymbol;

  return {
    displayValue,
    displaySymbol,
    isLoading,
    isInvalid,
    handleDisplayChange,
    handleDisplayMax,
    setIsFocused,
  };
};

export default useVotingInputDisplay;
