import useContestConfigStore from "@hooks/useContestConfig/store";
import { useShallow } from "zustand/shallow";
import useDisplayPrice from "./useDisplayPrice";

interface NativeDisplayPrice {
  formatted: string;
  isLoading: boolean;
}

/**
 * useDisplayPrice pre-fed with the contest's native currency symbol and joined into
 * the single display string — for surfaces that render one price and nothing else.
 */
const useNativeDisplayPrice = (value: string): NativeDisplayPrice => {
  const chainNativeCurrencySymbol = useContestConfigStore(
    useShallow(state => state.contestConfig.chainNativeCurrencySymbol),
  );
  const { displayValue, displaySymbol, isLoading } = useDisplayPrice(value, chainNativeCurrencySymbol);

  return {
    formatted: displaySymbol === "$" ? `$${displayValue}` : `${displayValue} ${displaySymbol}`,
    isLoading,
  };
};

export default useNativeDisplayPrice;
