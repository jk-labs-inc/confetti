export type MedalPlace = 1 | 2 | 3;

export const isMedalPlace = (rank: number): rank is MedalPlace => rank >= 1 && rank <= 3;

export const MEDAL_IMAGE_WIDTH_PX = 121;
export const MEDAL_IMAGE_HEIGHT_PX = 144;
export const MEDAL_DISC_DIAMETER_PX = 120;
export const MEDAL_DISC_CENTER_X_PX = 59.5;
export const MEDAL_DISC_CENTER_Y_PX = 84;
export const AVATAR_SHARE_OF_DISC = 0.82;

export const MEDAL_IMAGE_CLASS_NAME = "absolute inset-0 h-full w-full object-contain";

export const CHIP_RIM_INSET_PX = 2;
export const CHIP_FONT_TO_HEIGHT_RATIO = 0.6;

export const WINNER_GLOW_TO_AVATAR_RATIO = 0.23;
export const WINNER_GLOW_COLOR = "rgba(255, 227, 94, 0.35)";

export const MEDAL_CHIP_CLASS_NAME: Record<MedalPlace, string> = {
  1: "bg-[#ffe35e] text-[#2b2104]",
  2: "bg-[#e6e6e6] text-[#1c1c1c]",
  3: "bg-[#c07b3c] text-[#1f1003]",
};

export const PLAIN_MEDAL_CHIP_CLASS_NAME = "bg-[#3d3d3d] text-[#e5e5e5]";

export const EMPTY_MEDAL_IMAGE_CLASS_NAME = "opacity-35 grayscale-[60%]";
export const EMPTY_MEDAL_RING_CLASS_NAME =
  "absolute inset-0 rounded-full border-2 border-dashed border-neutral-9 motion-safe:animate-[spin_16s_linear_infinite]";
export const EMPTY_MEDAL_MARK = "?";
export const EMPTY_MEDAL_MARK_TO_AVATAR_RATIO = 0.42;
export const EMPTY_MEDAL_CHIP_CLASS_NAME = "opacity-60";

export const PLAIN_MEDAL_RIM_TOP_COLOR = "#757575";
export const PLAIN_MEDAL_RIM_BOTTOM_COLOR = "#383838";
export const PLAIN_MEDAL_FACE_COLOR = "#232323";
export const PLAIN_MEDAL_RIBBON_LEFT_COLOR = "#4a4a4a";
export const PLAIN_MEDAL_RIBBON_RIGHT_COLOR = "#575757";
export const PLAIN_MEDAL_RIM_WIDTH_PX = 5;
