import AnimatedBlinkText from "@components/UI/AnimatedBlinkText";
import useContestConfigStore from "@hooks/useContestConfig/store";
import useDisplayPrice from "@hooks/useCurrency/useDisplayPrice";
import { FC } from "react";
import Skeleton from "react-loading-skeleton";
import { useShallow } from "zustand/shallow";

interface ChargeInfoExponentialProps {
  costToVote: string;
}

const ChargeInfoExponential: FC<ChargeInfoExponentialProps> = ({ costToVote }) => {
  const chainNativeCurrencySymbol = useContestConfigStore(
    useShallow(state => state.contestConfig.chainNativeCurrencySymbol),
  );

  const { displayValue, displaySymbol, isLoading } = useDisplayPrice(costToVote, chainNativeCurrencySymbol);

  if (isLoading) {
    return <Skeleton width={80} height={16} baseColor="#706f78" highlightColor="#FFE25B" />;
  }

  return (
    <AnimatedBlinkText value={costToVote} blinkColor="#78FFC6">
      <p>{displaySymbol === "$" ? `$${displayValue}` : `${displayValue} ${displaySymbol}`}</p>
    </AnimatedBlinkText>
  );
};

export default ChargeInfoExponential;
