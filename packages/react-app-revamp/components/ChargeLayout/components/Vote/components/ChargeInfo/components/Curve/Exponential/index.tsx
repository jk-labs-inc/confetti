import AnimatedBlinkText from "@components/UI/AnimatedBlinkText";
import DualPriceDisplay from "@components/UI/DualPriceDisplay";
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

  const { displayValue, displaySymbol, secondaryValue, secondarySymbol } = useDisplayPrice(
    costToVote,
    chainNativeCurrencySymbol,
  );

  return (
    <AnimatedBlinkText value={costToVote} blinkColor="#78FFC6">
      <DualPriceDisplay
        displayValue={displayValue}
        displaySymbol={displaySymbol}
        secondaryValue={secondaryValue}
        secondarySymbol={secondarySymbol}
        secondaryClassName="text-[12px]"
      />
    </AnimatedBlinkText>
  );
};

export default ChargeInfoExponential;
