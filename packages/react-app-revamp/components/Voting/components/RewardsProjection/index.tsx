import GradientText from "@components/UI/GradientText";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import useContestConfigStore from "@hooks/useContestConfig/store";
import useDisplayPrice from "@hooks/useCurrency/useDisplayPrice";
import { FC } from "react";
import Skeleton from "react-loading-skeleton";
import { useShallow } from "zustand/shallow";
import VotingWidgetRewardsProjectionContainer from "./components/Container";
import VotingWidgetRewardsProjectionTooltip from "./components/Tooltip";
import { useVotingRewardsProjection } from "./hooks";

interface VotingWidgetRewardsProjectionProps {
  currentPricePerVote: bigint;
  inputValue: string;
  submissionsCount: number;
}

const TOOLTIP_ID = "rewards-projection-tooltip";

const VotingWidgetRewardsProjection: FC<VotingWidgetRewardsProjectionProps> = ({
  currentPricePerVote,
  inputValue,
  submissionsCount,
}) => {
  const contestConfig = useContestConfigStore(useShallow(state => state.contestConfig));

  const { winUpToFormatted, shouldShow } = useVotingRewardsProjection({
    currentPricePerVote,
    inputValue,
    submissionsCount,
  });

  const { displayValue, displaySymbol, isLoading } = useDisplayPrice(
    winUpToFormatted,
    contestConfig.chainNativeCurrencySymbol,
  );

  if (!shouldShow) return null;

  return (
    <VotingWidgetRewardsProjectionContainer>
      <div className="flex items-center gap-2">
        <GradientText textSizeClassName="text-[16px]" isFontSabo={false}>
          win up to
        </GradientText>
        <InformationCircleIcon
          className="text-neutral-14 w-5 h-5"
          data-tooltip-id={TOOLTIP_ID}
          data-tooltip-place="right"
        />
      </div>
      <VotingWidgetRewardsProjectionTooltip tooltipId={TOOLTIP_ID} />
      <div className="ml-auto">
        {isLoading ? (
          <Skeleton width={100} height={24} baseColor="#706f78" highlightColor="#FFE25B" />
        ) : (
          <GradientText textSizeClassName="text-[24px] font-bold uppercase" isFontSabo={false}>
            {displaySymbol === "$" ? `$${displayValue}` : `${displayValue} ${displaySymbol}`}
          </GradientText>
        )}
      </div>
    </VotingWidgetRewardsProjectionContainer>
  );
};

export default VotingWidgetRewardsProjection;
