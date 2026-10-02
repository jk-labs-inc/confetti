import { getChipOverhangPx, getMedalAvatarGeometry } from "@components/UI/MedalAvatar/geometry";

export const PANEL_CURVE_SQUARE_PX = 160;
export const PANEL_CURVE_HEIGHT_CLASS_NAME = "h-[168px]";
export const PODIUM_STRIP_MAX_CARDS = 5;
export const PODIUM_CARD_MIN_WIDTH_PX = 176;
export const STRIP_GAP_PX = 8;
export const STRIP_AVATAR_PX = 30;
export const STRIP_CHIP_PX = 16;
export const STRIP_MEDAL_GEOMETRY = getMedalAvatarGeometry(STRIP_AVATAR_PX);
export const STRIP_MEDAL_ROW_HEIGHT_PX = STRIP_MEDAL_GEOMETRY.medalHeightPx + getChipOverhangPx(STRIP_CHIP_PX);
export const EMPTY_GHOST_SLOT_COUNT = 5;

export enum MarketPanelTab {
  Activity = "activity",
  Leaderboard = "leaderboard",
  PriceCurve = "priceCurve",
}
