import { formatNumber } from "@helpers/formatNumber";
import { useVirtualizer } from "@tanstack/react-virtual";
import moment from "moment";
import { FC, useMemo, useRef } from "react";
import { PositionedVote, VoterCluster } from "../types";
import VoterGroup from "./VoterGroup";
import VoterRow from "./VoterRow";

interface VoterClusterContentProps {
  cluster: VoterCluster;
  formatPrice: (nativePrice: number) => string;
  entryTitlesById: Map<string, string>;
  rankById: Map<string, number>;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

interface VoterGroupData {
  address: string;
  casts: PositionedVote[];
  totalVotes: number;
  totalSpent: number;
}

const VoterClusterContent: FC<VoterClusterContentProps> = ({
  cluster,
  formatPrice,
  entryTitlesById,
  rankById,
  onLoadMore,
  hasMore,
  isLoadingMore,
}) => {
  const groups = useMemo<VoterGroupData[]>(() => {
    const byAddress = new Map<string, VoterGroupData>();
    for (const vote of cluster.voters) {
      const key = vote.userAddress.toLowerCase();
      let group = byAddress.get(key);
      if (!group) {
        group = { address: vote.userAddress, casts: [], totalVotes: 0, totalSpent: 0 };
        byAddress.set(key, group);
      }
      group.casts.push(vote);
      group.totalVotes += vote.voteAmount;
      group.totalSpent += vote.totalCost;
    }
    return Array.from(byAddress.values()).sort((a, b) => b.totalVotes - a.totalVotes);
  }, [cluster]);

  const totalVotes = useMemo(() => groups.reduce((sum, group) => sum + group.totalVotes, 0), [groups]);

  const earliestMs = (cluster.voters[0]?.createdAt ?? 0) * 1000;
  const latestMs = (cluster.voters[cluster.voters.length - 1]?.createdAt ?? 0) * 1000;
  const spansTime = latestMs - earliestMs >= 60_000;
  const headerTime = spansTime
    ? `${moment(earliestMs).format("MMM D • h:mm A")} – ${moment(latestMs).format("h:mm A")}`
    : moment(latestMs).format("MMM D • h:mm A");

  const scrollRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: groups.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 52,
    overscan: 8,
  });

  return (
    <div className="flex flex-col gap-2 text-[12px] text-neutral-11">
      <div className="flex items-baseline justify-between gap-3 font-bold">
        <span>
          {groups.length} {groups.length === 1 ? "voter" : "voters"}
          <span className="text-neutral-11/55 font-normal">
            {" · "}
            {formatNumber(totalVotes)} {totalVotes === 1 ? "vote" : "votes"}
          </span>
        </span>
        <span className="text-neutral-11/55 font-normal whitespace-nowrap">{headerTime}</span>
      </div>

      <div ref={scrollRef} className="no-scrollbar overflow-y-auto overscroll-contain" style={{ maxHeight: "60vh" }}>
        <div style={{ height: rowVirtualizer.getTotalSize(), width: "100%", position: "relative" }}>
          {rowVirtualizer.getVirtualItems().map(virtualRow => {
            const group = groups[virtualRow.index];
            return (
              <div
                key={group.address}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                  paddingBottom: 12,
                }}
              >
                {group.casts.length === 1 ? (
                  <VoterRow
                    vote={group.casts[0]}
                    formatPrice={formatPrice}
                    entryTitlesById={entryTitlesById}
                    rankById={rankById}
                  />
                ) : (
                  <VoterGroup
                    address={group.address}
                    casts={group.casts}
                    totalVotes={group.totalVotes}
                    totalSpent={group.totalSpent}
                    formatPrice={formatPrice}
                    entryTitlesById={entryTitlesById}
                    rankById={rankById}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {hasMore && (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={isLoadingMore}
          className="mt-1 self-center rounded-full bg-neutral-4 px-3 py-1 text-[12px] font-semibold text-neutral-9 disabled:opacity-60"
        >
          {isLoadingMore ? "loading…" : "load more"}
        </button>
      )}
    </div>
  );
};

export default VoterClusterContent;
