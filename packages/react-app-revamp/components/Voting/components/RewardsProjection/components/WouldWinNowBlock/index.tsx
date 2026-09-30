import CompactAmount from "@components/UI/CompactAmount";
import GradientText from "@components/UI/GradientText";
import { VotingWidgetLayout } from "@components/Voting/types";
import useNativeDisplayPrice from "@hooks/useCurrency/useNativeDisplayPrice";
import { FC } from "react";
import Skeleton from "react-loading-skeleton";
import { PROJECTION_LAYOUT_CLASS_NAMES } from "../../constants";
import WouldWinNowTooltip from "../WouldWinNowTooltip";

interface WouldWinNowBlockProps {
  amount: string;
  isBelowSpend: boolean;
  layout?: VotingWidgetLayout;
}

const WouldWinNowBlock: FC<WouldWinNowBlockProps> = ({ amount, isBelowSpend, layout = VotingWidgetLayout.regular }) => {
  const { formatted, isLoading } = useNativeDisplayPrice(amount);
  const classNames = PROJECTION_LAYOUT_CLASS_NAMES[layout];

  return (
    <div className="flex flex-col">
      <div className={`flex items-center ${classNames.labelRow}`}>
        <GradientText textSizeClassName={classNames.label} isFontSabo={false}>
          estimated payout
        </GradientText>
        <WouldWinNowTooltip isBelowSpend={isBelowSpend} iconClassName={classNames.icon} />
      </div>
      {isLoading ? (
        <Skeleton width={100} height={24} baseColor="#706f78" highlightColor="#FFE25B" />
      ) : isBelowSpend ? (
        <span className={`${classNames.value} font-bold text-primary-10`}>
          <CompactAmount value={formatted} />
        </span>
      ) : (
        <GradientText textSizeClassName={`${classNames.value} font-bold`} isFontSabo={false}>
          <CompactAmount value={formatted} />
        </GradientText>
      )}
    </div>
  );
};

export default WouldWinNowBlock;
