import useContestConfigStore from "@hooks/useContestConfig/store";
import { useCurrencyStore } from "@hooks/useCurrency/store";
import { convertToDisplayPrice, DisplayPriceOptions } from "@hooks/useCurrency/useDisplayPrice";
import useNativeRates from "@hooks/useCurrency/useNativeRates";
import { useCallback } from "react";

export type NativePriceFormatter = (nativeAmount: string | number, options?: DisplayPriceOptions) => string;

export const useNativePriceFormatter = (): NativePriceFormatter => {
  const nativeCurrencySymbol = useContestConfigStore(state => state.contestConfig.chainNativeCurrencySymbol);
  const displayCurrency = useCurrencyStore(state => state.displayCurrency);
  const { data: nativeRates } = useNativeRates();

  return useCallback(
    (nativeAmount, options) => {
      const { displayValue, displaySymbol } = convertToDisplayPrice(
        String(nativeAmount),
        nativeCurrencySymbol ?? "",
        displayCurrency,
        nativeRates ?? {},
        {},
        undefined,
        options,
      );
      return displaySymbol === "$" ? `$${displayValue}` : `${displayValue} ${displaySymbol}`;
    },
    [nativeCurrencySymbol, displayCurrency, nativeRates],
  );
};

export default useNativePriceFormatter;
