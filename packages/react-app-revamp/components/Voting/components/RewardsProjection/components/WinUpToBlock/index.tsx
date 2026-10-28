import CompactAmount from "@components/UI/CompactAmount";
import GradientText from "@components/UI/GradientText";
import { VotingWidgetLayout } from "@components/Voting/types";
import { FC } from "react";
import Skeleton from "react-loading-skeleton";
import { PROJECTION_LAYOUT_CLASS_NAMES } from "../../constants";
import VotingWidgetRewardsProjectionTooltip from "../Tooltip";

interface WinUpToBlockProps {
  formatted: string;
  isLoading: boolean;
  centered?: boolean;
  layout?: VotingWidgetLayout;
}

const WinUpToBlock: FC<WinUpToBlockProps> = ({
  formatted,
  isLoading,
  centered,
  layout = VotingWidgetLayout.regular,
}) => {
  const classNames = PROJECTION_LAYOUT_CLASS_NAMES[layout];

  return (
    <div className={centered ? "mx-auto flex flex-col items-center" : "ml-auto flex flex-col items-end"}>
      <div className={`flex items-center ${classNames.labelRow}`}>
        <GradientText textSizeClassName={classNames.label} isFontSabo={false}>
          max payout
        </GradientText>
        <VotingWidgetRewardsProjectionTooltip iconClassName={classNames.icon} />
      </div>
      {isLoading ? (
        <Skeleton width={100} height={24} baseColor="#706f78" highlightColor="#FFE25B" />
      ) : (
        <GradientText textSizeClassName={`${classNames.value} font-bold uppercase`} isFontSabo={false}>
          <CompactAmount value={formatted} />
        </GradientText>
      )}
    </div>
  );
};

export default WinUpToBlock;
