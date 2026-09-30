import { FC } from "react";
import {
  CHIP_FONT_TO_HEIGHT_RATIO,
  CHIP_RIM_INSET_PX,
  isMedalPlace,
  MEDAL_CHIP_CLASS_NAME,
  PLAIN_MEDAL_CHIP_CLASS_NAME,
} from "./constants";
import { MedalAvatarGeometry } from "./geometry";

interface MedalChipProps {
  rank: number;
  chipPx: number;
  geometry: MedalAvatarGeometry;
  className?: string;
}

const MedalChip: FC<MedalChipProps> = ({ rank, chipPx, geometry, className = "" }) => (
  <span
    aria-hidden
    className={`absolute flex -translate-x-1/2 items-center justify-center rounded-full border-2 border-black px-1 font-black leading-none tabular-nums ${
      isMedalPlace(rank) ? MEDAL_CHIP_CLASS_NAME[rank] : PLAIN_MEDAL_CHIP_CLASS_NAME
    } ${className}`}
    style={{
      left: geometry.discCenterXPx,
      top: geometry.medalHeightPx - CHIP_RIM_INSET_PX - chipPx / 2,
      minWidth: chipPx,
      height: chipPx,
      fontSize: Math.round(chipPx * CHIP_FONT_TO_HEIGHT_RATIO),
    }}
  >
    {rank}
  </span>
);

export default MedalChip;
