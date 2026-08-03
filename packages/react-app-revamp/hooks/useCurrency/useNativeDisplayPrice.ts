import useContestConfigStore from "@hooks/useContestConfig/store";
import { useShallow } from "zustand/shallow";
import useDisplayPrice, { DisplayPriceOptions } from "./useDisplayPrice";

interface NativeDisplayPrice {
  formatted: string;
  isLoading: boolean;
}

/**
 * useDisplayPrice pre-fed with the contest's native currency symbol and joined into
 * the single display string — for surfaces that render one price and nothing else.
 */
const useNativeDisplayPrice = (value: string, options?: DisplayPriceOptions): NativeDisplayPrice => {
  const chainNativeCurrencySymbol = useContestConfigStore(
    useShallow(state => state.contestConfig.chainNativeCurrencySymbol),
  );
  const { displayValue, displaySymbol, isLoading } = useDisplayPrice(
    value,
    chainNativeCurrencySymbol,
    undefined,
    undefined,
    options,
  );

  return {
    formatted: displaySymbol === "$" ? `$${displayValue}` : `${displayValue} ${displaySymbol}`,
    isLoading,
  };
};

export default useNativeDisplayPrice;
