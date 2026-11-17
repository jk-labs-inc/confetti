import { RewardsStickerSize } from "./types";

export const STICKER_TILT_CLASS_NAMES: Record<RewardsStickerSize, string> = {
  card: "rotate-5",
  stat: "-rotate-3",
  headline: "-rotate-4",
  hero: "-rotate-4",
};

export const STICKER_RING_CLASS_NAME = "shadow-[0_0_0_3px_#000]";

export const COIN_FRAME_CLASS_NAMES: Record<RewardsStickerSize, string> = {
  card: "size-8.5 -mr-2.5",
  stat: "size-8 -mr-2.5",
  headline: "size-13 -mr-4",
  hero: "size-16 -mr-5",
};
