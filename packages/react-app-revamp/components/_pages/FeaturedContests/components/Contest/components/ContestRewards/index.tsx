import RewardsSticker from "@components/UI/RewardsSticker";
import RewardsStickerSkeleton from "@components/UI/RewardsSticker/components/RewardsStickerSkeleton";
import { toRewardTokenItems } from "@hooks/useCurrency/useTotalRewardsUsd";
import { ContestWithTotalRewards } from "lib/contests/types";
import { FC, useMemo } from "react";
import { CardState } from "../../types";

interface ContestRewardsProps {
  cardState: CardState;
  rewardsData?: ContestWithTotalRewards | null;
  isRewardsFetching: boolean;
}

const ContestRewards: FC<ContestRewardsProps> = ({ cardState, rewardsData, isRewardsFetching }) => {
  const tokenItems = useMemo(
    () => toRewardTokenItems(rewardsData?.hasRewards ? (rewardsData.rewardsData ?? undefined) : undefined),
    [rewardsData],
  );

  if (cardState === "canceled") return null;
  if (isRewardsFetching && !rewardsData) return <RewardsStickerSkeleton size="card" />;

  return <RewardsSticker size="card" items={tokenItems} chainName={rewardsData?.chain ?? ""} phase={cardState} />;
};

export default ContestRewards;
