import {
  AVATAR_SHARE_OF_DISC,
  CHIP_RIM_INSET_PX,
  MEDAL_DISC_CENTER_X_PX,
  MEDAL_DISC_CENTER_Y_PX,
  MEDAL_DISC_DIAMETER_PX,
  MEDAL_IMAGE_HEIGHT_PX,
  MEDAL_IMAGE_WIDTH_PX,
} from "./constants";

export interface MedalAvatarGeometry {
  medalWidthPx: number;
  medalHeightPx: number;
  discCenterXPx: number;
  avatarLeftPx: number;
  avatarTopPx: number;
}

export const getChipOverhangPx = (chipPx: number): number => chipPx / 2 - CHIP_RIM_INSET_PX;

export const getMedalAvatarGeometry = (avatarPx: number): MedalAvatarGeometry => {
  const scale = avatarPx / AVATAR_SHARE_OF_DISC / MEDAL_DISC_DIAMETER_PX;
  const discCenterXPx = MEDAL_DISC_CENTER_X_PX * scale;

  return {
    medalWidthPx: Math.round(MEDAL_IMAGE_WIDTH_PX * scale),
    medalHeightPx: Math.round(MEDAL_IMAGE_HEIGHT_PX * scale),
    discCenterXPx,
    avatarLeftPx: Math.round(discCenterXPx - avatarPx / 2),
    avatarTopPx: Math.round(MEDAL_DISC_CENTER_Y_PX * scale - avatarPx / 2),
  };
};
