import RewardsNumberDisplay from "@components/_pages/Contest/Rewards/components/UI/Display/Number";
import { Reward } from "@components/_pages/Contest/Rewards/types";
import RefreshButton from "@components/UI/RefreshButton";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { peggedRewardTokenAddress } from "lib/rewards/valuation";
import { FC } from "react";
import { useShallow } from "zustand/shallow";

interface RewardsPlayerViewClaimRewardTotalRewardsProps {
  totalRewards: Reward[];
  isContestInProcess: boolean;
  onRefresh?: () => void;
}

const RewardsPlayerViewClaimRewardTotalRewards: FC<RewardsPlayerViewClaimRewardTotalRewardsProps> = ({
  totalRewards,
  isContestInProcess,
  onRefresh,
}) => {
  const chainName = useContestConfigStore(useShallow(state => state.contestConfig.chainName));

  return (
    <div className={`flex flex-col ${isContestInProcess ? "gap-6" : "gap-8 md:gap-12"}`}>
      <div className="flex flex-col gap-1">
        <div className="flex gap-4 items-center">
          <p className="text-[24px] text-neutral-11">my rewards</p>
          <RefreshButton onRefresh={() => onRefresh?.()} size="sm" />
        </div>
        {isContestInProcess ? <p className="text-[12px] text-neutral-9">if contest ended now</p> : null}
      </div>

      {totalRewards.map((reward, index) => (
        <RewardsNumberDisplay
          key={index}
          value={reward.value}
          symbol={reward.symbol}
          decimals={reward.decimals}
          index={index}
          isBold={true}
          tokenAddress={peggedRewardTokenAddress(chainName, reward.address)}
          chainName={chainName}
        />
      ))}
    </div>
  );
};

export default RewardsPlayerViewClaimRewardTotalRewards;
