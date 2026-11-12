import { ENTRY_ACCENT_COLOR, withAlpha } from "@helpers/entryColors";

export const PAGE_GUTTER_PX = 24;
export const NEIGHBOR_PEEK_PX = 10;
export const CARD_MIN_ASPECT = 0.8;
export const CARD_MAX_ASPECT = 1.3;
export const STICKER_ROOM_PX = 24;
export const GLOW_ROOM_PX = 12;
export const CARD_IMAGE_MIN_VISIBLE = 0.97;

export const RUBBER_BAND_COEF = 0.55; // iOS scroll-view rubber band: overshoot maps to c*x/(1+c*x) — asymptotic, saturates at ~1 card

export const FILL_BOTTOM_GAP_PX = 16;
export const ENTRY_CAROUSEL_FOOTER_ID = "entry-carousel-footer";

export const MAX_VISIBLE = 2;
export const WINDOW_RADIUS = MAX_VISIBLE + 2; // mount heavy card content only within this ring distance of center

export const MAX_SCALE_DROP = 0.08;
export const MAX_OPACITY_DROP = 0.5;

export const DRAG_THRESHOLD = 6; // px of mouse movement before a pointer gesture counts as a drag (vs a click)
export const DRAG_THRESHOLD_TOUCH = 8; // finger slop (Android ViewConfiguration = 8dp; finger roll during a tap must not read as a drag)
export const LOAD_MORE_THRESHOLD = 2; // fetch the next page as the centered index nears the loaded end

export const FLICK_PROJECTION_S = 0.12; // seconds of release velocity to project past the lift point
export const MAX_FLICK = 4; // cap on cards crossed by a single flick (no runaway spin)
export const FLICK_MIN_VELOCITY_PX_S = 400;
export const FLICK_MIN_TRAVEL_PX = 25;
export const VELOCITY_WINDOW_MS = 100; // release velocity is measured over this trailing window of move samples
export const VELOCITY_STALE_MS = 170; // no move sample this recent at lift → velocity is 0 (hold-then-release never flicks)

export const FOIL_PX = 1.5;
export const ENTRY_ACCENT_GLOW = `0 0 26px -4px ${withAlpha(ENTRY_ACCENT_COLOR, 0.5)}, 0 12px 32px -14px rgba(0,0,0,0.9)`;
export const GRAIN_URL = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;
