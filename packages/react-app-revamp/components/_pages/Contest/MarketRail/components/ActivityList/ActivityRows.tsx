import { useVoterRibbon } from "@components/PriceCurve/components/Voters/hooks/useVoterRibbon";
import { PositionedVote } from "@components/PriceCurve/components/Voters/types";
import { useNativePriceFormatter } from "@hooks/useNativePriceFormatter";
import { FC, useEffect, useRef, useState } from "react";
import ActivityRow from "./ActivityRow";
import { ACTIVITY_PAGE_SIZE } from "./constants";

interface ActivityRowsProps {
  votes: PositionedVote[];
  rankById: Map<string, number>;
  entryTitlesById: Map<string, string>;
}

const LOAD_MORE_MARGIN = "400px 0px";

const ActivityRows: FC<ActivityRowsProps> = ({ votes, rankById, entryTitlesById }) => {
  const { ordered, newIds, clearNew } = useVoterRibbon(votes);
  const formatPrice = useNativePriceFormatter();
  const [visibleCount, setVisibleCount] = useState(ACTIVITY_PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const hasMore = visibleCount < ordered.length;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) setVisibleCount(count => count + ACTIVITY_PAGE_SIZE);
      },
      { rootMargin: LOAD_MORE_MARGIN },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, visibleCount]);

  return (
    <div className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
      {ordered.slice(0, visibleCount).map(vote => (
        <ActivityRow
          key={vote.uuid}
          vote={vote}
          rank={rankById.get(vote.proposalId)}
          entryTitle={entryTitlesById.get(vote.proposalId)}
          formatPrice={formatPrice}
          isNew={newIds.has(vote.uuid)}
          onSeen={clearNew}
        />
      ))}
      <div ref={sentinelRef} className="h-px w-full shrink-0" />
    </div>
  );
};

export default ActivityRows;
