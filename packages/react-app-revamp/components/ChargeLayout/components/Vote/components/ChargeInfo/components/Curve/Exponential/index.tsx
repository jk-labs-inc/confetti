import AnimatedBlinkText from "@components/UI/AnimatedBlinkText";
import useContestConfigStore from "@hooks/useContestConfig/store";
import useDisplayPrice from "@hooks/useCurrency/useDisplayPrice";
import { FC } from "react";
import { useShallow } from "zustand/shallow";

interface ChargeInfoExponentialProps {
  costToVote: string;
}

const ChargeInfoExponential: FC<ChargeInfoExponentialProps> = ({ costToVote }) => {
  const chainNativeCurrencySymbol = useContestConfigStore(
    useShallow(state => state.contestConfig.chainNativeCurrencySymbol),
  );

  const { displayValue, displaySymbol } = useDisplayPrice(costToVote, chainNativeCurrencySymbol);

  return (
    <AnimatedBlinkText value={costToVote} blinkColor="#78FFC6">
      <p>{displaySymbol === "$" ? `$${displayValue}` : `${displayValue} ${displaySymbol}`}</p>
    </AnimatedBlinkText>
  );
};

export default ChargeInfoExponential;
