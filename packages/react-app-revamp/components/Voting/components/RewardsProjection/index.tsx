import GradientText from "@components/UI/GradientText";
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
  /** Native-unit spend to project while the input is empty; rendered greyed out. */
  placeholderSpend?: string;
}

const VotingWidgetRewardsProjection: FC<VotingWidgetRewardsProjectionProps> = ({
  currentPricePerVote,
  inputValue,
  submissionsCount,
  placeholderSpend,
}) => {
  const contestConfig = useContestConfigStore(useShallow(state => state.contestConfig));
  const isGhost = !inputValue && parseFloat(placeholderSpend || "0") > 0;

  const { winUpToFormatted, shouldShow } = useVotingRewardsProjection({
    currentPricePerVote,
    inputValue: isGhost && placeholderSpend ? placeholderSpend : inputValue,
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
        <VotingWidgetRewardsProjectionTooltip />
      </div>
      <div className="ml-auto">
        {isLoading ? (
          <Skeleton width={100} height={24} baseColor="#706f78" highlightColor="#FFE25B" />
        ) : isGhost ? (
          <span className="text-[24px] font-bold uppercase text-neutral-9">
            {displaySymbol === "$" ? `$${displayValue}` : `${displayValue} ${displaySymbol}`}
          </span>
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
