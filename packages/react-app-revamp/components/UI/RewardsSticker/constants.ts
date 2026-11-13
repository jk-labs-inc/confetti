import { RewardsStickerSize } from "./types";

export const STICKER_TILT_CLASS_NAMES: Record<RewardsStickerSize, string> = {
  card: "rotate-5",
  stat: "-rotate-3",
  headline: "",
  bar: "",
};

export const STICKER_RING_CLASS_NAME = "shadow-[0_0_0_3px_#000]";

export const COIN_FRAME_CLASS_NAMES: Record<RewardsStickerSize, string> = {
  card: "size-8.5 -mr-2.5",
  stat: "size-8 -mr-2.5",
  headline: "size-13 -ml-3",
  bar: "size-[42px] -ml-2",
};
