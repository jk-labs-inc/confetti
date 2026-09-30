import VoterRibbonDesktop from "@components/PriceCurve/components/Voters/Ribbon/VoterRibbonDesktop";
import { useContestActivityFeed } from "@hooks/useContestActivityFeed";
import { ContestStatus, useContestStatusStore } from "@hooks/useContestStatus/store";
import { useNativePriceFormatter } from "@hooks/useNativePriceFormatter";
import { FC } from "react";
import { EMPTY_GHOST_SLOT_COUNT } from "../../constants";
import MarketPanelEmptyState from "../EmptyState";
import { EMPTY_ACTIVITY_COPY } from "../EmptyState/copy";
import GhostChip from "../EmptyState/GhostChip";

const ActivityRibbon: FC = () => {
  const { votes, rankById, entryTitlesById, isLoading } = useContestActivityFeed();
  const contestStatus = useContestStatusStore(state => state.contestStatus);
  const isVotingOpen = contestStatus === ContestStatus.VotingOpen;
  const formatPrice = useNativePriceFormatter();

  if (isLoading && votes.length === 0)
    return <div className="h-[108px] w-full animate-pulse rounded-[15px] bg-neutral-2" />;
  if (votes.length === 0)
    return (
      <MarketPanelEmptyState
        {...EMPTY_ACTIVITY_COPY[contestStatus]}
        slots={Array.from({ length: EMPTY_GHOST_SLOT_COUNT }, (_, i) => (
          <GhostChip key={i} />
        ))}
      />
    );

  return (
    <VoterRibbonDesktop
      votes={votes}
      rankById={rankById}
      formatPrice={formatPrice}
      entryTitlesById={entryTitlesById}
      isLive={isVotingOpen}
      showHeader={false}
      isInteractive={false}
    />
  );
};

export default ActivityRibbon;
