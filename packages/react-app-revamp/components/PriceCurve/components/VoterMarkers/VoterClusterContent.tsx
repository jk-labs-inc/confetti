import { formatNumber } from "@helpers/formatNumber";
import useScrollFade from "@hooks/useScrollFade";
import moment from "moment";
import { FC, useMemo, useRef } from "react";
import { MAX_TOOLTIP_VOTERS } from "./constants";
import { AvatarCluster, PositionedVote } from "./types";
import VoterGroup from "./VoterGroup";
import VoterRow from "./VoterRow";

interface VoterClusterContentProps {
  cluster: AvatarCluster;
  formatPrice: (nativePrice: number) => string;
  entryTitlesById: Map<string, string>;
  entryColorsById: Map<string, string>;
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
  entryColorsById,
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
    // Biggest voters first; sort is stable so ties keep first-seen (chronological) order.
    return Array.from(byAddress.values()).sort((a, b) => b.totalVotes - a.totalVotes);
  }, [cluster]);

  const totalVotes = useMemo(() => groups.reduce((sum, group) => sum + group.totalVotes, 0), [groups]);

  const shownGroups = groups.slice(0, MAX_TOOLTIP_VOTERS);
  const remaining = groups.length - shownGroups.length;

  const scrollRef = useRef<HTMLDivElement>(null);
  const { maskImageStyle } = useScrollFade(scrollRef, shownGroups.length, [cluster]);

  const earliestMs = cluster.voters[0].createdAt * 1000;
  const latestMs = cluster.voters[cluster.voters.length - 1].createdAt * 1000;
  const spansTime = latestMs - earliestMs >= 60_000;
  const headerTime = spansTime
    ? `${moment(earliestMs).format("MMM D • h:mm A")} – ${moment(latestMs).format("h:mm A")}`
    : moment(latestMs).format("MMM D • h:mm A");

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
      <div
        ref={scrollRef}
        className="flex flex-col gap-3 max-h-[260px] overflow-y-auto no-scrollbar"
        style={maskImageStyle ? { maskImage: maskImageStyle, WebkitMaskImage: maskImageStyle } : undefined}
      >
        {shownGroups.map(group =>
          group.casts.length === 1 ? (
            <VoterRow
              key={group.address}
              vote={group.casts[0]}
              formatPrice={formatPrice}
              entryTitlesById={entryTitlesById}
              entryColorsById={entryColorsById}
            />
          ) : (
            <VoterGroup
              key={group.address}
              address={group.address}
              casts={group.casts}
              totalVotes={group.totalVotes}
              totalSpent={group.totalSpent}
              formatPrice={formatPrice}
              entryTitlesById={entryTitlesById}
              entryColorsById={entryColorsById}
            />
          ),
        )}
        {remaining > 0 && (
          <span className="text-neutral-11/45">
            +{remaining} more {remaining === 1 ? "voter" : "voters"}
          </span>
        )}
      </div>
    </div>
  );
};

export default VoterClusterContent;
