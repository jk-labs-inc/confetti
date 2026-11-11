import RewardsSticker from "@components/UI/RewardsSticker";
import RewardsStickerSkeleton from "@components/UI/RewardsSticker/components/RewardsStickerSkeleton";
import { RewardsStickerSize } from "@components/UI/RewardsSticker/types";
import { useContestPoolDisplay } from "@hooks/useContestPoolDisplay";
import { FC } from "react";

interface ContestRewardsInfoProps {
  variant?: Exclude<RewardsStickerSize, "card">;
  className?: string;
}

const ContestRewardsInfo: FC<ContestRewardsInfoProps> = ({ variant = "stat", className }) => {
  const pool = useContestPoolDisplay();

  if (pool.status === "empty") return null;

  const sticker =
    pool.status === "loading" ? (
      <RewardsStickerSkeleton size={variant} />
    ) : variant === "headline" ? (
      <RewardsSticker
        size="headline"
        items={pool.tokenItems}
        chainName={pool.chainName}
        phase={pool.phase}
        audience={pool.audience}
      />
    ) : (
      <RewardsSticker size="stat" items={pool.tokenItems} chainName={pool.chainName} phase={pool.phase} />
    );

  return className ? <span className={className}>{sticker}</span> : sticker;
};

export default ContestRewardsInfo;
