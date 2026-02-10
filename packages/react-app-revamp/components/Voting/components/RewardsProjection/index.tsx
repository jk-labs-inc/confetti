import GradientText from "@components/UI/GradientText";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import useContestConfigStore from "@hooks/useContestConfig/store";
import useDisplayPrice from "@hooks/useCurrency/useDisplayPrice";
import { FC } from "react";
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

  const { displayValue, displaySymbol } = useDisplayPrice(
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
        <GradientText textSizeClassName="text-[24px] font-bold" isFontSabo={false}>
          {displaySymbol === "$" ? `$${displayValue}` : `${displayValue} ${displaySymbol.toLowerCase()}`}
        </GradientText>
      </div>
    </VotingWidgetRewardsProjectionContainer>
  );
};

export default VotingWidgetRewardsProjection;
