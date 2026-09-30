import { useContestStatusStore } from "@hooks/useContestStatus/store";
import { FC } from "react";
import { EMPTY_LEADERBOARD_COPY } from "../../../MarketPanel/components/EmptyState/copy";
import { RAIL_GHOST_FADE_STYLE, RAIL_GHOST_RANKS } from "../../constants";
import GhostRailRow from "./GhostRailRow";

const EmptyLeaderboard: FC = () => {
  const { title, hint } = EMPTY_LEADERBOARD_COPY[useContestStatusStore(state => state.contestStatus)];

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-col gap-0.5 normal-case">
        <p className="text-[13px] font-semibold text-neutral-11">{title}</p>
        <p className="text-[11px] text-neutral-9">{hint}</p>
      </div>
      <div aria-hidden className="flex flex-col gap-1.5" style={RAIL_GHOST_FADE_STYLE}>
        {RAIL_GHOST_RANKS.map(rank => (
          <GhostRailRow key={rank} rank={rank} />
        ))}
      </div>
    </div>
  );
};

export default EmptyLeaderboard;
