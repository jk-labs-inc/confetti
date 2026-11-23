import { isUsdPegged, VoteCurrency, voteCurrencyUsdRate } from "lib/voteCurrency";
import useNativeRates from "./useNativeRates";

interface VoteCurrencyUsdRate {
  rate: number | undefined;
  isLoading: boolean;
  isResolved: boolean;
}

const useVoteCurrencyUsdRate = (voteCurrency: VoteCurrency | undefined): VoteCurrencyUsdRate => {
  const isMarketPriced = !isUsdPegged(voteCurrency);
  const { data: nativeRates, isLoading } = useNativeRates({ enabled: isMarketPriced });

  return {
    rate: voteCurrencyUsdRate(voteCurrency, nativeRates),
    isLoading: isMarketPriced && isLoading,
    isResolved: !isMarketPriced || nativeRates !== undefined,
  };
};

export default useVoteCurrencyUsdRate;
