import WouldWinNowTooltip from "@components/Voting/components/RewardsProjection/components/WouldWinNowTooltip";
import { WIN_GRADIENT } from "@components/VotingActionBar/constants";
import FitText from "@components/VotingActionBar/FitText";
import useNativeDisplayPrice from "@hooks/useCurrency/useNativeDisplayPrice";
import { FC } from "react";

interface WouldWinNowStatProps {
  amount: string;
  isBelowSpend: boolean;
}

const WouldWinNowStat: FC<WouldWinNowStatProps> = ({ amount, isBelowSpend }) => {
  const { formatted } = useNativeDisplayPrice(amount);

  return (
    <div className="flex min-w-0 flex-[1.25] flex-col items-center leading-tight">
      <span className="flex w-full min-w-0 items-center justify-center gap-0.5 text-neutral-9">
        <FitText
          text="would win now"
          min={8}
          max={11}
          className="block min-w-0 overflow-hidden whitespace-nowrap text-center"
        />
        <WouldWinNowTooltip isBelowSpend={isBelowSpend} iconClassName="w-3 h-3" />
      </span>
      <FitText
        text={formatted}
        min={8}
        max={20}
        group
        compactZeros
        className={`block w-full overflow-hidden whitespace-nowrap text-center font-bold ${
          isBelowSpend ? "text-primary-10" : "bg-clip-text text-transparent"
        }`}
        style={isBelowSpend ? undefined : { backgroundImage: WIN_GRADIENT }}
      />
    </div>
  );
};

export default WouldWinNowStat;
