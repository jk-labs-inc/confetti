import { UseVoteProjectionsReturn } from "@hooks/useVoteProjections";
import { FC } from "react";
import VotingWidgetRewardsProjectionContainer from "./components/Container";
import PushToFirstBlock from "./components/PushToFirstBlock";
import WinUpToBlock from "./components/WinUpToBlock";
import WouldWinNowBlock from "./components/WouldWinNowBlock";

interface VotingWidgetRewardsProjectionProps {
  projections: UseVoteProjectionsReturn;
}

const VotingWidgetRewardsProjection: FC<VotingWidgetRewardsProjectionProps> = ({ projections }) => {
  const { entryProjection, winUpTo } = projections;

  if (!winUpTo.shouldShow) return null;

  return (
    <VotingWidgetRewardsProjectionContainer>
      {entryProjection?.kind === "pushToFirst" ? (
        <PushToFirstBlock remainingToFirst={entryProjection.remainingToFirst} />
      ) : entryProjection?.kind === "wouldWinNow" ? (
        <WouldWinNowBlock amount={entryProjection.amount} isBelowSpend={entryProjection.isBelowSpend} />
      ) : null}
      <WinUpToBlock amount={winUpTo.amount} centered={entryProjection === null} />
    </VotingWidgetRewardsProjectionContainer>
  );
};

export default VotingWidgetRewardsProjection;
