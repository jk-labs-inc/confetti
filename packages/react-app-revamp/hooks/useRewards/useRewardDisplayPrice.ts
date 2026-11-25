import useDisplayPrice, { DisplayPriceResult } from "@hooks/useCurrency/useDisplayPrice";
import { isDollarDenominatedPot } from "lib/rewards/valuation";

const useRewardDisplayPrice = (
  value: string,
  symbol: string,
  tokenAddress?: string,
  chainName?: string,
): DisplayPriceResult =>
  useDisplayPrice(value, symbol, tokenAddress, chainName, {
    dollarDenominated: isDollarDenominatedPot(chainName, [{ tokenAddress }]),
  });

export default useRewardDisplayPrice;
