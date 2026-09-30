import { MEDAL_IMAGES } from "@components/PriceCurve/components/Voters/components/EntryRankMedal";
import { FC } from "react";
import { GHOST_SEAT_LABEL } from "../../../MarketPanel/components/EmptyState/copy";
import { RAIL_MEDAL_GEOMETRY } from "../../constants";

interface GhostRailRowProps {
  rank: number;
}

const GhostRailRow: FC<GhostRailRowProps> = ({ rank }) => (
  <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-xl border border-dashed border-neutral-4 px-2 py-1.5">
    <img
      src={MEDAL_IMAGES[rank]}
      alt=""
      className="object-contain opacity-60 grayscale-[40%]"
      style={{ width: RAIL_MEDAL_GEOMETRY.medalWidthPx, height: RAIL_MEDAL_GEOMETRY.medalHeightPx }}
    />
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="text-[12px] normal-case leading-tight text-neutral-9">{GHOST_SEAT_LABEL}</span>
      <span className="h-2 w-20 rounded-full bg-neutral-3" />
    </div>
    <span className="h-3 w-10 rounded-full bg-neutral-3" />
  </div>
);

export default GhostRailRow;
