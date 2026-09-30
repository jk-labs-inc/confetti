export const SHEET_TOP_INSET_PX = 56;
export const SHEET_CONTENT_HEIGHT = `calc(100dvh - ${SHEET_TOP_INSET_PX}px)`;
export const HALF_SHEET_SNAP = 0.83;
export const FULL_SHEET_SNAP = 1;
export const SHEET_SNAP_POINTS = [HALF_SHEET_SNAP, FULL_SHEET_SNAP];
export const SHEET_HANDLE_BLOCK_PX = 24;
export const SHEET_CHROME_PX = SHEET_HANDLE_BLOCK_PX + SHEET_TOP_INSET_PX;
export const HALF_SHEET_BODY_HEIGHT = `calc(${Math.round(HALF_SHEET_SNAP * 100)}dvh - ${SHEET_CHROME_PX}px)`;
export const SHEET_HEADER_ROW_PX = 36;
export const SHEET_BODY_GAP_PX = 12;
export const SHEET_CONTENT_PADDING_BOTTOM_PX = 8;
export const SHEET_PRICE_CURVE_MAX_HEIGHT = `calc(${HALF_SHEET_BODY_HEIGHT} - ${SHEET_HEADER_ROW_PX + SHEET_BODY_GAP_PX + SHEET_CONTENT_PADDING_BOTTOM_PX}px - env(safe-area-inset-bottom))`;
export const SHEET_CLASS_NAME =
  "bg-secondary-1 rounded-t-[24px]! border-t-white/12! border-x-0! shadow-[0_-24px_48px_-24px_rgba(0,0,0,0.9)]";

export enum MarketSheetSegment {
  Activity = "activity",
  Leaderboard = "leaderboard",
  Price = "price",
}
