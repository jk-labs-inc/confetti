import { VotingWidgetLayout } from "@components/Voting/types";
import { UseVoteProjectionsReturn } from "@hooks/useVoteProjections";
import { FC } from "react";
import VotingWidgetRewardsProjectionContainer from "./components/Container";
import PushToFirstBlock from "./components/PushToFirstBlock";
import WinUpToBlock from "./components/WinUpToBlock";
import WouldWinNowBlock from "./components/WouldWinNowBlock";

interface VotingWidgetRewardsProjectionProps {
  projections: UseVoteProjectionsReturn;
  layout?: VotingWidgetLayout;
}

const VotingWidgetRewardsProjection: FC<VotingWidgetRewardsProjectionProps> = ({
  projections,
  layout = VotingWidgetLayout.regular,
}) => {
  const { entryProjection, winUpTo } = projections;

  if (!winUpTo.shouldShow) return null;

  return (
    <VotingWidgetRewardsProjectionContainer layout={layout}>
      {entryProjection?.kind === "pushToFirst" ? (
        <PushToFirstBlock remainingToFirst={entryProjection.remainingToFirst} layout={layout} />
      ) : entryProjection?.kind === "wouldWinNow" ? (
        <WouldWinNowBlock amount={entryProjection.amount} isBelowSpend={entryProjection.isBelowSpend} layout={layout} />
      ) : null}
      <WinUpToBlock amount={winUpTo.amount} centered={entryProjection === null} layout={layout} />
    </VotingWidgetRewardsProjectionContainer>
  );
};

export default VotingWidgetRewardsProjection;
