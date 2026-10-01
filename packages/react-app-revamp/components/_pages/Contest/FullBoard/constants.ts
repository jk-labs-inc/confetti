export type PodiumPlace = 1 | 2 | 3;
export type PodiumSize = "board" | "sheet";

export const PODIUM_SIZE = 3;
export const PODIUM_ORDER: PodiumPlace[] = [2, 1, 3];
export const BOARD_TOP_ROWS = 8;
export const BOARD_SKELETON_ROWS = 6;
export const BOARD_ROW_GRID_CLASS_NAME = "grid grid-cols-[36px_28px_minmax(0,1fr)_96px_72px] items-center gap-3";
export const BOARD_AVATAR_PX = 28;
export const ME_LABEL = "me";
export const ME_HIGHLIGHT_CLASS_NAME = "border border-neutral-17 bg-neutral-3";
export const UNRANKED_LABEL = "–";

export enum BoardSort {
  Payout = "payout",
  Multiple = "multiple",
}
