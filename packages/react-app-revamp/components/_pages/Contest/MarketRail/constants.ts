import { CHART_PADDING_WITH_LABELS } from "@components/PriceCurve/constants";
import { ChartPadding } from "@components/PriceCurve/types";
import { getMedalAvatarGeometry } from "@components/UI/MedalAvatar/geometry";
import { CSSProperties } from "react";

const RAIL_GHOST_FADE = "linear-gradient(to bottom, rgba(0,0,0,0.9), transparent)";

export const RAIL_MAX_ROWS = 5;
export const LEADERBOARD_SKELETON_ROWS = 3;
export const RAIL_AVATAR_PX = 24;
export const RAIL_CHIP_PX = 13;
export const RAIL_ENTRY_MEDAL_PX = 11;
export const RAIL_MEDAL_GEOMETRY = getMedalAvatarGeometry(RAIL_AVATAR_PX);
export const RAIL_MEDAL_CELL_PX = RAIL_MEDAL_GEOMETRY.medalWidthPx;
export const RAIL_GHOST_RANKS = [1, 2, 3];
export const RAIL_GHOST_FADE_STYLE: CSSProperties = { maskImage: RAIL_GHOST_FADE, WebkitMaskImage: RAIL_GHOST_FADE };
export const RAIL_PRICE_CURVE_ASPECT_CLASS_NAME = "aspect-[5/4]";
export const RAIL_PRICE_CURVE_PADDING: ChartPadding = { ...CHART_PADDING_WITH_LABELS, top: 16, bottom: 20 };

export const COMPACT_CURVE_LABEL_GUTTER_PX = 44;
export const COMPACT_CURVE_VERTICAL_INSET_PX = 8;
export const COMPACT_CURVE_GRID_LINE_COUNT = 3;
export const COMPACT_CURVE_LINE_WIDTH = 1.5;
export const COMPACT_CURVE_DOT_RADIUS = 4;
export const COMPACT_CURVE_HALO_RADIUS = 7;
export const COMPACT_CURVE_HALO_FILL = "rgba(120, 255, 198, 0.28)";
export const COMPACT_CURVE_GRID_COLOR = "#3d3d3d";
export const COMPACT_CURVE_GRID_DASH = "4 4";
export const COMPACT_CURVE_LABEL_COLOR = "#9d9d9d";
export const COMPACT_CURVE_LABEL_OFFSET_PX = 6;

export const RAIL_ROW_GRID_CLASS_NAME =
  "grid grid-cols-[20px_24px_minmax(0,1fr)_auto] wide:grid-cols-[24px_24px_minmax(0,1fr)_auto] gap-[7px] wide:gap-2 items-center";
export const COMPACT_CURVE_HOVER_LINE_STROKE = "rgba(255, 255, 255, 0.25)";
export const COMPACT_CURVE_HOVER_PRICE_COLOR = "#58f4ff";
export const COMPACT_CURVE_HOVER_LABEL_OFFSET_PX = 10;
export const COMPACT_CURVE_HOVER_LABEL_FLIP_RATIO = 0.6;
export const COMPACT_CURVE_HOVER_LABEL_HALF_HEIGHT_PX = 11;
export const COMPACT_CURVE_HOVER_DATE_FORMAT = "MMM D, h:mma";
export const COMPACT_CURVE_HOVER_LABEL_HALO_COLOR = "var(--color-secondary-1)";
export const COMPACT_CURVE_HOVER_LABEL_HALO_WIDTH = 4;
