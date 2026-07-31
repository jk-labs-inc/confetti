import VotingWidgetRewardsProjectionTooltip from "@components/Voting/components/RewardsProjection/components/Tooltip";
import { WIN_GRADIENT } from "@components/VotingActionBar/constants";
import FitText from "@components/VotingActionBar/FitText";
import useNativeDisplayPrice from "@hooks/useCurrency/useNativeDisplayPrice";
import { FC } from "react";

interface WinUpToStatProps {
  amount: string;
}

const WinUpToStat: FC<WinUpToStatProps> = ({ amount }) => {
  const { formatted } = useNativeDisplayPrice(amount);

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center leading-tight">
      <span className="flex items-center gap-0.5 whitespace-nowrap text-[11px] text-neutral-9">
        win up to
        <VotingWidgetRewardsProjectionTooltip iconClassName="w-3 h-3" />
      </span>
      <FitText
        text={formatted}
        min={8}
        max={20}
        group
        compactZeros
        className="block w-full overflow-hidden whitespace-nowrap text-center font-bold bg-clip-text text-transparent"
        style={{ backgroundImage: WIN_GRADIENT }}
      />
    </div>
  );
};

export default WinUpToStat;
