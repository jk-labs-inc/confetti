import useContestConfigStore from "@hooks/useContestConfig/store";
import useDisplayPrice from "@hooks/useCurrency/useDisplayPrice";
import { FC } from "react";
import Skeleton from "react-loading-skeleton";
import { formatEther } from "viem";
import { useShallow } from "zustand/shallow";

interface ChargeInfoFlatProps {
  costToVote: string;
}

const ChargeInfoFlat: FC<ChargeInfoFlatProps> = ({ costToVote }) => {
  const chainNativeCurrencySymbol = useContestConfigStore(
    useShallow(state => state.contestConfig.chainNativeCurrencySymbol),
  );

  const { displayValue, displaySymbol, isLoading } = useDisplayPrice(costToVote, chainNativeCurrencySymbol);

  if (isLoading) {
    return <Skeleton width={80} height={16} baseColor="#706f78" highlightColor="#FFE25B" />;
  }

  return (
    <p className="uppercase">
      {displaySymbol === "$" ? `$${displayValue}` : `${displayValue} ${displaySymbol}`}
    </p>
  );
};

export default ChargeInfoFlat;
