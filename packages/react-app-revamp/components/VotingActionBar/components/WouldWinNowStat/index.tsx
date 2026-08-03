import WouldWinNowTooltipContent from "@components/Voting/components/RewardsProjection/components/WouldWinNowTooltipContent";
import StatTooltipTrigger from "@components/VotingActionBar/components/StatTooltipTrigger";
import { WIN_GRADIENT } from "@components/VotingActionBar/constants";
import FitText from "@components/VotingActionBar/FitText";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import useNativeDisplayPrice from "@hooks/useCurrency/useNativeDisplayPrice";
import { FC } from "react";

interface WouldWinNowStatProps {
  amount: string;
  isBelowSpend: boolean;
}

const WouldWinNowStat: FC<WouldWinNowStatProps> = ({ amount, isBelowSpend }) => {
  const { formatted } = useNativeDisplayPrice(amount);

  return (
    <StatTooltipTrigger
      content={<WouldWinNowTooltipContent isBelowSpend={isBelowSpend} />}
      tooltipClassName="max-w-[250px]"
      className="flex min-w-0 flex-[1.4] flex-col items-center leading-tight"
    >
      <span className="flex items-center gap-0.5 whitespace-nowrap text-[11px] text-neutral-9">
        would win now
        <InformationCircleIcon aria-hidden="true" className="w-3 h-3" />
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
    </StatTooltipTrigger>
  );
};

export default WouldWinNowStat;
