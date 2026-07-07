// most of the code is used from https://motion.dev/examples/react-carousel-coverflow

export const CARD_WIDTH_PCT = 62; // center card width as a % of the stage width (selected card dominates)
export const CARD_ASPECT = 5 / 4; // card height / width (image / title entries)
export const COVER_MIN_VISIBLE = 0.75; // a crop must keep at least this fraction of the image; mismatched images bleed up to this budget, then letterbox over a blurred fill
export const TWEET_CARD_ASPECT = 8 / 5; // taller cards for tweet entries so the tweet fits without being cut off
export const NEIGHBOR_SPACING_PCT = 46; // horizontal offset between adjacent cards (% of stage width)

export const EDGE_RESISTANCE = 0.3; // rubber-band drag past the ends of the bounded 2-entry track (0 = wall, 1 = free)
export const BOUNDED_END_SHIFT = 1; // at an end of the 2-entry track, pull the active card this fraction of the

export const FILL_BOTTOM_GAP_PX = 16; // breathing room kept below a carousel that grows to fill the viewport
export const MAX_FILL_ASPECT = 1.8; // cap on how tall cards grow when filling the void (height / width)

export const MAX_ROTATE_DEG = 30; // neighbors tilt up to 30 to face the center (gentler curve)
export const PERSPECTIVE_PX = 1400; // shared 3D perspective depth (higher = flatter / less dramatic)
export const DEPTH_PX = 90; // translateZ pushback per step away from center
export const MAX_VISIBLE = 2; // cards kept visible on each side of center
export const WINDOW_RADIUS = MAX_VISIBLE + 2; // mount heavy card content only within this ring distance of center

export const MAX_SCALE_DROP = 0.24; // one step off-center renders at scale 0.76 (neighbors recede more)
export const MAX_OPACITY_DROP = 0.5; // one step off-center renders at opacity 0.5 (neighbors a touch more faded)

export const DRAG_THRESHOLD = 6; // px of movement before a pointer gesture counts as a drag (vs a tap)
export const LOAD_MORE_THRESHOLD = 2; // fetch the next page as the centered index nears the loaded end

export const FLICK_PROJECTION_S = 0.12; // seconds of release velocity to project past the lift point
export const MAX_FLICK = 4; // cap on cards crossed by a single flick (no runaway spin)
