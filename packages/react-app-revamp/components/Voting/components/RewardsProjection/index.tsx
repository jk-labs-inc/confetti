import { VotingWidgetLayout } from "@components/Voting/types";
import useNativeDisplayPrice from "@hooks/useCurrency/useNativeDisplayPrice";
import { UseVoteProjectionsReturn } from "@hooks/useVoteProjections";
import { FC } from "react";
import RewardsProjectionBlocks from "./components/Blocks";
import { entryPriceInput } from "./display";

interface VotingWidgetRewardsProjectionProps {
  projections: UseVoteProjectionsReturn;
  layout?: VotingWidgetLayout;
}

const VotingWidgetRewardsProjection: FC<VotingWidgetRewardsProjectionProps> = ({
  projections,
  layout = VotingWidgetLayout.regular,
}) => {
  const { entryProjection, winUpTo } = projections;
  const entryInput = entryPriceInput(entryProjection);
  const entryPrice = useNativeDisplayPrice(entryInput.value, entryInput.options);
  const winUpToPrice = useNativeDisplayPrice(winUpTo.amount);

  if (!winUpTo.shouldShow) return null;

  return (
    <RewardsProjectionBlocks
      entry={entryProjection}
      entryFormatted={entryPrice.formatted}
      winUpToFormatted={winUpToPrice.formatted}
      isLoading={entryPrice.isLoading || winUpToPrice.isLoading}
      layout={layout}
    />
  );
};

export default VotingWidgetRewardsProjection;
