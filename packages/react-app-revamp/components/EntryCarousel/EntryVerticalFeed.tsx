import { ContestStatus } from "@hooks/useContestStatus/store";
import { EntryPreview } from "@hooks/useDeployContest/slices/contestMetadataSlice";
import { ProposalCore } from "@hooks/useProposal/store";
import { FC, useEffect, useRef, useState } from "react";
import EntryCard from "./EntryCard";
import { useEntryFeed } from "./useEntryFeed";

const FEED_VH = 80;
const EST_CARD_PX = 400;
const MOUNT_MARGIN = "100% 0px 100% 0px";

interface EntryVerticalFeedProps {
  proposals: ProposalCore[];
  enabledPreview: EntryPreview | null;
  contestStatus: ContestStatus;
  hasNextPage: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}

const EntryVerticalFeed: FC<EntryVerticalFeedProps> = ({
  proposals,
  enabledPreview,
  contestStatus,
  hasNextPage,
  isLoadingMore,
  onLoadMore,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mounted, setMounted] = useState<Set<number>>(() => new Set([0, 1]));

  const { cards, n, totalVotes, maybeLoadMore } = useEntryFeed({
    proposals,
    activeIndex,
    hasNextPage,
    isLoadingMore,
    onLoadMore,
  });

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) setActiveIndex(Number((e.target as HTMLElement).dataset.index));
        }
      },
      { root, rootMargin: "-50% 0px -50% 0px", threshold: 0 },
    );
    root.querySelectorAll<HTMLElement>("[data-index]").forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [n]);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      entries => {
        const seen: number[] = [];
        for (const e of entries) {
          if (e.isIntersecting) seen.push(Number((e.target as HTMLElement).dataset.index));
        }
        if (seen.length) {
          setMounted(prev => {
            let changed = false;
            const next = new Set(prev);
            for (const i of seen) {
              if (!next.has(i)) {
                next.add(i);
                changed = true;
              }
            }
            return changed ? next : prev;
          });
        }
      },
      { root, rootMargin: MOUNT_MARGIN, threshold: 0 },
    );
    root.querySelectorAll<HTMLElement>("[data-index]").forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [n]);

  useEffect(() => {
    maybeLoadMore(activeIndex);
  }, [activeIndex, maybeLoadMore]);

  if (n === 0) return null;

  return (
    <div
      ref={containerRef}
      className="no-scrollbar relative flex w-full snap-y snap-proximity flex-col gap-4 overflow-y-auto overscroll-contain"
      style={{ height: `${FEED_VH}svh` }}
    >
      {cards.map((proposal, index) => (
        <div
          key={proposal.id}
          data-index={index}
          className="shrink-0 snap-center px-3 first:pt-3 last:pb-3"
          style={mounted.has(index) ? undefined : { height: EST_CARD_PX }}
        >
          {mounted.has(index) ? (
            <EntryCard
              proposal={proposal}
              enabledPreview={enabledPreview}
              contestStatus={contestStatus}
              totalVotes={totalVotes}
              active={index === activeIndex}
              variant="feed"
            />
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default EntryVerticalFeed;
