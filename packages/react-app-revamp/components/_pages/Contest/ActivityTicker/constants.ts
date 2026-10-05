import { CSSProperties } from "react";
import { ACTIVITY_ROW_HEIGHT_PX } from "../MarketRail/components/ActivityList/constants";

const TICKER_EDGE_FADE_MASK = "linear-gradient(to right, transparent, #000 16px, #000 calc(100% - 48px), transparent)";

export const TICKER_MAX_EVENTS = 12;
export const TICKER_VELOCITY_PX_PER_S = 32;
export const TICKER_GAP_PX = 32;
export const TICKER_AVATAR_PX = 18;
export const TICKER_EDGE_FADE_STYLE: CSSProperties = {
  maskImage: TICKER_EDGE_FADE_MASK,
  WebkitMaskImage: TICKER_EDGE_FADE_MASK,
};
export const TICKER_ENTRY_TITLE_CLASS_NAME = "max-w-[240px] truncate";
export const TICKER_UNKNOWN_ENTRY_LABEL = "an entry";
export const ACTIVITY_MODAL_VISIBLE_ROWS = 9.5;
export const ACTIVITY_MODAL_LIST_MAX_HEIGHT_PX = ACTIVITY_ROW_HEIGHT_PX * ACTIVITY_MODAL_VISIBLE_ROWS;
