import { ContestStatus } from "@hooks/useContestStatus/store";
import { EntryPreview } from "@hooks/useDeployContest/slices/contestMetadataSlice";
import { ProposalCore } from "@hooks/useProposal/store";
import { FC, useEffect, useRef, useState } from "react";
import EntryCard from "./EntryCard";
import { useEntryFeed } from "./useEntryFeed";

const EST_CARD_PX = 360;
const MOUNT_MARGIN = "800px 0px 800px 0px";

interface EntryListProps {
  proposals: ProposalCore[];
  enabledPreview: EntryPreview | null;
  contestStatus: ContestStatus;
  hasNextPage: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}

const EntryList: FC<EntryListProps> = ({
  proposals,
  enabledPreview,
  contestStatus,
  hasNextPage,
  isLoadingMore,
  onLoadMore,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mounted, setMounted] = useState<Set<number>>(() => new Set([0, 1, 2]));

  const { cards, n, totalVotes } = useEntryFeed({
    proposals,
    activeIndex: selectedIndex,
    hasNextPage,
    isLoadingMore,
    onLoadMore,
  });

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      entries => {
        const seen: number[] = [];
        for (const e of entries) {
          if (e.isIntersecting) seen.push(Number((e.target as HTMLElement).dataset.index));
        }
        if (!seen.length) return;
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
      },
      { rootMargin: MOUNT_MARGIN, threshold: 0 },
    );
    node.querySelectorAll<HTMLElement>("[data-index]").forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [n]);

  if (n === 0) return null;

  return (
    <div ref={containerRef} className="flex flex-col gap-4">
      {cards.map((proposal, index) => (
        <div
          key={proposal.id}
          data-index={index}
          onClick={() => setSelectedIndex(index)}
          className="cursor-pointer"
          style={mounted.has(index) ? undefined : { height: EST_CARD_PX }}
        >
          {mounted.has(index) ? (
            <EntryCard
              proposal={proposal}
              enabledPreview={enabledPreview}
              contestStatus={contestStatus}
              totalVotes={totalVotes}
              active={index === selectedIndex}
              variant="feed"
            />
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default EntryList;
