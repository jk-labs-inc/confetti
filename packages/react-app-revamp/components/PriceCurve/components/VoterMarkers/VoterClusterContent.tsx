import useScrollFade from "@hooks/useScrollFade";
import moment from "moment";
import { FC, useRef } from "react";
import { MAX_TOOLTIP_ROWS } from "./constants";
import { AvatarCluster } from "./types";
import VoterRow from "./VoterRow";

interface VoterClusterContentProps {
  cluster: AvatarCluster;
  formatPrice: (nativePrice: number) => string;
  entryTitlesById: Map<string, string>;
  entryColorsById: Map<string, string>;
}

const VoterClusterContent: FC<VoterClusterContentProps> = ({
  cluster,
  formatPrice,
  entryTitlesById,
  entryColorsById,
}) => {
  const count = cluster.voters.length;
  const shown = cluster.voters.slice(0, MAX_TOOLTIP_ROWS);
  const remaining = count - shown.length;

  const scrollRef = useRef<HTMLDivElement>(null);
  const { maskImageStyle } = useScrollFade(scrollRef, shown.length, [cluster]);

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
          {count} {count === 1 ? "voter" : "voters"}
        </span>
        <span className="text-neutral-11/55 font-normal whitespace-nowrap">{headerTime}</span>
      </div>
      <div
        ref={scrollRef}
        className="flex flex-col gap-2 max-h-[220px] overflow-y-auto no-scrollbar"
        style={maskImageStyle ? { maskImage: maskImageStyle, WebkitMaskImage: maskImageStyle } : undefined}
      >
        {shown.map(voter => (
          <VoterRow
            key={voter.uuid}
            vote={voter}
            formatPrice={formatPrice}
            entryTitlesById={entryTitlesById}
            entryColorsById={entryColorsById}
          />
        ))}
        {remaining > 0 && <span className="text-neutral-11/45">+{remaining} more</span>}
      </div>
    </div>
  );
};

export default VoterClusterContent;
