import useContestConfigStore from "@hooks/useContestConfig/store";
import useDisplayPrice from "@hooks/useCurrency/useDisplayPrice";
import { FC } from "react";
import { formatEther } from "viem";
import { useShallow } from "zustand/shallow";

interface ChargeInfoFlatProps {
  costToVote: string;
}

const ChargeInfoFlat: FC<ChargeInfoFlatProps> = ({ costToVote }) => {
  const chainNativeCurrencySymbol = useContestConfigStore(
    useShallow(state => state.contestConfig.chainNativeCurrencySymbol),
  );

  const { displayValue, displaySymbol } = useDisplayPrice(costToVote, chainNativeCurrencySymbol);

  return (
    <p>
      {displaySymbol === "$" ? `$${displayValue}` : `${displayValue} ${displaySymbol}`}
    </p>
  );
};

export default ChargeInfoFlat;
