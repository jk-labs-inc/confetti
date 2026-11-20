import useContestConfigStore from "@hooks/useContestConfig/store";
import { useShallow } from "zustand/shallow";
import { DisplayPriceOptions } from "./useDisplayPrice";
import useVoteCurrencyDisplayPrice from "./useVoteCurrencyDisplayPrice";

interface NativeDisplayPrice {
  formatted: string;
  isLoading: boolean;
}

const useNativeDisplayPrice = (value: string, options?: DisplayPriceOptions): NativeDisplayPrice => {
  const voteCurrency = useContestConfigStore(useShallow(state => state.contestConfig.voteCurrency));
  const { displayValue, displaySymbol, isLoading } = useVoteCurrencyDisplayPrice(value, voteCurrency, options);

  return {
    formatted: displaySymbol === "$" ? `$${displayValue}` : `${displayValue} ${displaySymbol}`,
    isLoading,
  };
};

export default useNativeDisplayPrice;
