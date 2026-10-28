import { VotingWidgetLayout } from "@components/Voting/types";
import type { EntryProjection } from "@hooks/useVoteProjections";
import { FC } from "react";
import VotingWidgetRewardsProjectionContainer from "../Container";
import PushToFirstBlock from "../PushToFirstBlock";
import WinUpToBlock from "../WinUpToBlock";
import WouldWinNowBlock from "../WouldWinNowBlock";

interface RewardsProjectionBlocksProps {
  entry: EntryProjection | null;
  entryFormatted: string;
  winUpToFormatted: string;
  isLoading: boolean;
  layout?: VotingWidgetLayout;
}

const RewardsProjectionBlocks: FC<RewardsProjectionBlocksProps> = ({
  entry,
  entryFormatted,
  winUpToFormatted,
  isLoading,
  layout = VotingWidgetLayout.regular,
}) => (
  <VotingWidgetRewardsProjectionContainer layout={layout}>
    {entry?.kind === "pushToFirst" ? (
      <PushToFirstBlock formatted={entryFormatted} isLoading={isLoading} layout={layout} />
    ) : entry?.kind === "wouldWinNow" ? (
      <WouldWinNowBlock
        formatted={entryFormatted}
        isBelowSpend={entry.isBelowSpend}
        isLoading={isLoading}
        layout={layout}
      />
    ) : null}
    <WinUpToBlock formatted={winUpToFormatted} isLoading={isLoading} centered={entry === null} layout={layout} />
  </VotingWidgetRewardsProjectionContainer>
);

export default RewardsProjectionBlocks;
