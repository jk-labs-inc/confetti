import useContestConfigStore from "@hooks/useContestConfig/store";
import { useCurrencyStore } from "@hooks/useCurrency/store";
import { DisplayPriceOptions, formatVoteCurrencyPrice } from "@hooks/useCurrency/useDisplayPrice";
import useVoteCurrencyUsdRate from "@hooks/useCurrency/useVoteCurrencyUsdRate";
import { useCallback } from "react";

export type NativePriceFormatter = (nativeAmount: string | number, options?: DisplayPriceOptions) => string;

export const useNativePriceFormatter = (): NativePriceFormatter => {
  const voteCurrency = useContestConfigStore(state => state.contestConfig.voteCurrency);
  const displayCurrency = useCurrencyStore(state => state.displayCurrency);
  const { rate } = useVoteCurrencyUsdRate(voteCurrency);

  return useCallback(
    (nativeAmount, options) => {
      const { displayValue, displaySymbol } = formatVoteCurrencyPrice({
        value: String(nativeAmount),
        voteCurrency,
        rate,
        displayCurrency,
        options,
      });
      return displaySymbol === "$" ? `$${displayValue}` : `${displayValue} ${displaySymbol}`;
    },
    [voteCurrency, displayCurrency, rate],
  );
};

export default useNativePriceFormatter;
