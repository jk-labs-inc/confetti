import RewardsSticker from "@components/UI/RewardsSticker";
import RewardsStickerSkeleton from "@components/UI/RewardsSticker/components/RewardsStickerSkeleton";
import { useContestPoolDisplay } from "@hooks/useContestPoolDisplay";
import { FC } from "react";

const ContestRewardsInfo: FC = () => {
  const pool = useContestPoolDisplay();

  if (pool.status === "empty") return null;

  if (pool.status === "loading") return <RewardsStickerSkeleton size="stat" />;

  return <RewardsSticker size="stat" items={pool.tokenItems} chainName={pool.chainName} phase={pool.phase} />;
};

export default ContestRewardsInfo;
