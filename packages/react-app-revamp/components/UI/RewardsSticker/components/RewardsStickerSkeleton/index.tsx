import { FC } from "react";
import { COIN_FRAME_CLASS_NAMES, STICKER_RING_CLASS_NAME, STICKER_TILT_CLASS_NAMES } from "../../constants";
import { RewardsStickerSize } from "../../types";

interface RewardsStickerSkeletonProps {
  size: RewardsStickerSize;
}

const SKELETON_BODY_CLASS_NAMES: Record<RewardsStickerSize, string> = {
  card: "h-8 w-20 rounded-xl",
  stat: "h-7 w-24 rounded-xl",
  headline: "h-13 w-40 rounded-2xl",
};

const RewardsStickerSkeleton: FC<RewardsStickerSkeletonProps> = ({ size }) => (
  <span aria-hidden="true" className={`flex shrink-0 items-center ${STICKER_TILT_CLASS_NAMES[size]}`}>
    <span
      className={`relative z-1 block animate-pulse rounded-full bg-neutral-7 ${COIN_FRAME_CLASS_NAMES[size]} ${STICKER_RING_CLASS_NAME}`}
    />
    <span
      className={`block animate-pulse bg-neutral-5 ${SKELETON_BODY_CLASS_NAMES[size]} ${STICKER_RING_CLASS_NAME}`}
    />
  </span>
);

export default RewardsStickerSkeleton;
