import { RewardTokenItem } from "lib/rewards/types";
import { isDollarDenominatedPot } from "lib/rewards/valuation";
import { DisplayCurrency, useCurrencyStore } from "./store";

const usePotDisplayCurrency = (chainName: string | undefined, items: RewardTokenItem[]): DisplayCurrency => {
  const toggledCurrency = useCurrencyStore(state => state.displayCurrency);

  return isDollarDenominatedPot(chainName, items) ? "usd" : toggledCurrency;
};

export default usePotDisplayCurrency;
