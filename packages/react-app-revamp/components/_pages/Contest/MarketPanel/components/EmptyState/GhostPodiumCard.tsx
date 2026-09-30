import { MEDAL_IMAGES } from "@components/PriceCurve/components/Voters/components/EntryRankMedal";
import { FC } from "react";
import { PODIUM_CARD_MIN_WIDTH_PX, STRIP_MEDAL_GEOMETRY } from "../../constants";
import { GHOST_SEAT_LABEL } from "./copy";

interface GhostPodiumCardProps {
  rank: number;
}

const GhostPodiumCard: FC<GhostPodiumCardProps> = ({ rank }) => (
  <div
    className="flex shrink-0 flex-col gap-2 rounded-[14px] border border-dashed border-neutral-4 px-3 py-2.5"
    style={{ width: PODIUM_CARD_MIN_WIDTH_PX }}
  >
    <div className="flex items-center gap-1.5">
      <img
        src={MEDAL_IMAGES[rank]}
        alt=""
        className="object-contain opacity-60 grayscale-40"
        style={{ width: STRIP_MEDAL_GEOMETRY.medalWidthPx, height: STRIP_MEDAL_GEOMETRY.medalHeightPx }}
      />
      <span className="text-[12px] normal-case text-neutral-9">{GHOST_SEAT_LABEL}</span>
    </div>
    <span className="h-3.5 w-16 rounded-full bg-neutral-3" />
    <span className="h-2 w-24 rounded-full bg-neutral-3" />
  </div>
);

export default GhostPodiumCard;
