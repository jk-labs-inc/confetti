import { MEDAL_IMAGES } from "@components/PriceCurve/components/Voters/components/EntryRankMedal";
import { FC } from "react";
import {
  EMPTY_MEDAL_CHIP_CLASS_NAME,
  EMPTY_MEDAL_IMAGE_CLASS_NAME,
  EMPTY_MEDAL_MARK,
  EMPTY_MEDAL_MARK_TO_AVATAR_RATIO,
  EMPTY_MEDAL_RING_CLASS_NAME,
  MEDAL_IMAGE_CLASS_NAME,
  MedalPlace,
} from "./constants";
import { getChipOverhangPx, getMedalAvatarGeometry } from "./geometry";
import MedalChip from "./MedalChip";

interface EmptyMedalAvatarProps {
  rank: MedalPlace;
  avatarPx: number;
  chipPx?: number;
}

const EmptyMedalAvatar: FC<EmptyMedalAvatarProps> = ({ rank, avatarPx, chipPx }) => {
  const geometry = getMedalAvatarGeometry(avatarPx);

  return (
    <div
      aria-hidden
      className="relative shrink-0"
      style={{
        width: geometry.medalWidthPx,
        height: geometry.medalHeightPx,
        marginBottom: chipPx === undefined ? 0 : getChipOverhangPx(chipPx),
      }}
    >
      <img src={MEDAL_IMAGES[rank]} alt="" className={`${MEDAL_IMAGE_CLASS_NAME} ${EMPTY_MEDAL_IMAGE_CLASS_NAME}`} />
      <div
        className="absolute flex items-center justify-center rounded-full bg-true-black"
        style={{ left: geometry.avatarLeftPx, top: geometry.avatarTopPx, width: avatarPx, height: avatarPx }}
      >
        <span className={EMPTY_MEDAL_RING_CLASS_NAME} />
        <span
          className="font-black leading-none text-neutral-10"
          style={{ fontSize: Math.round(avatarPx * EMPTY_MEDAL_MARK_TO_AVATAR_RATIO) }}
        >
          {EMPTY_MEDAL_MARK}
        </span>
      </div>
      {chipPx !== undefined && (
        <MedalChip rank={rank} chipPx={chipPx} geometry={geometry} className={EMPTY_MEDAL_CHIP_CLASS_NAME} />
      )}
    </div>
  );
};

export default EmptyMedalAvatar;
