import { VoteCurrency } from "lib/voteCurrency";
import { useCurrencyStore } from "./store";
import { DisplayPriceOptions, DisplayPriceResult, formatVoteCurrencyPrice } from "./useDisplayPrice";
import useVoteCurrencyUsdRate from "./useVoteCurrencyUsdRate";

const useVoteCurrencyDisplayPrice = (
  value: string,
  voteCurrency: VoteCurrency | undefined,
  options: DisplayPriceOptions = {},
): DisplayPriceResult => {
  const displayCurrency = useCurrencyStore(state => state.displayCurrency);
  const { rate, isLoading: isRateLoading } = useVoteCurrencyUsdRate(voteCurrency);
  const result = formatVoteCurrencyPrice({ value, voteCurrency, rate, displayCurrency, options });

  return { ...result, isLoading: displayCurrency === "usd" && isRateLoading };
};

export default useVoteCurrencyDisplayPrice;
