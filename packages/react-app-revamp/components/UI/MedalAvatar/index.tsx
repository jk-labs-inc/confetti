import { MEDAL_IMAGES } from "@components/PriceCurve/components/Voters/components/EntryRankMedal";
import { Avatar } from "@components/UI/Avatar";
import { FC } from "react";
import { isMedalPlace, MEDAL_IMAGE_CLASS_NAME, WINNER_GLOW_COLOR, WINNER_GLOW_TO_AVATAR_RATIO } from "./constants";
import { getChipOverhangPx, getMedalAvatarGeometry } from "./geometry";
import MedalChip from "./MedalChip";
import PlainMedal from "./PlainMedal";

interface MedalAvatarProps {
  rank: number;
  avatarSrc: string;
  address: string;
  avatarPx: number;
  chipPx?: number;
}

const MedalAvatar: FC<MedalAvatarProps> = ({ rank, avatarSrc, address, avatarPx, chipPx }) => {
  const geometry = getMedalAvatarGeometry(avatarPx);
  const hasChip = chipPx !== undefined;
  const isPodium = isMedalPlace(rank);
  const winnerGlow =
    rank === 1
      ? `drop-shadow(0 0 ${Math.round(avatarPx * WINNER_GLOW_TO_AVATAR_RATIO)}px ${WINNER_GLOW_COLOR})`
      : undefined;

  return (
    <div
      className="relative shrink-0"
      style={{
        width: geometry.medalWidthPx,
        height: geometry.medalHeightPx,
        marginBottom: hasChip ? getChipOverhangPx(chipPx) : 0,
        filter: winnerGlow,
      }}
    >
      {isPodium ? (
        <img src={MEDAL_IMAGES[rank]} alt={`rank ${rank}`} className={MEDAL_IMAGE_CLASS_NAME} />
      ) : (
        <PlainMedal label={`rank ${rank}`} className={MEDAL_IMAGE_CLASS_NAME} />
      )}
      <div
        className="absolute rounded-full ring-2 ring-black/50"
        style={{ left: geometry.avatarLeftPx, top: geometry.avatarTopPx }}
      >
        <Avatar src={avatarSrc} address={address} sizePx={avatarPx} />
      </div>
      {hasChip && <MedalChip rank={rank} chipPx={chipPx} geometry={geometry} />}
    </div>
  );
};

export default MedalAvatar;
