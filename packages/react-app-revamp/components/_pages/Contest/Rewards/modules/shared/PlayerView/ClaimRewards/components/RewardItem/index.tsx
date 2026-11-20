import RewardsClaimButton from "@components/_pages/Contest/Rewards/components/UI/Buttons/Claim";
import RewardsNumberDisplay from "@components/_pages/Contest/Rewards/components/UI/Display/Number";
import VoterStatistics from "@components/_pages/Contest/Rewards/modules/Voters/Player/components/VoterStatistics";
import { Reward } from "@components/_pages/Contest/Rewards/types";
import GradientText from "@components/UI/GradientText";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { peggedRewardTokenAddress } from "lib/rewards/valuation";
import { FC, useState } from "react";
import { useShallow } from "zustand/shallow";

interface RewardItemProps {
  reward: Reward;
  rank: number;
  isActive: boolean;
  isClaimLoading: (rank: number, tokenAddress: string) => boolean;
  isRankClaimed: (rank: number) => boolean;
  isClaimSuccess?: (rank: number, tokenAddress: string) => boolean;
  isAdditionalStatisticsSupported?: boolean;
  onClaim: (rank: number, reward: Reward) => void;
}

const RewardItem: FC<RewardItemProps> = ({
  reward,
  rank,
  isActive,
  isClaimLoading,
  isRankClaimed,
  isClaimSuccess,
  isAdditionalStatisticsSupported,
  onClaim,
}) => {
  const [showAdditionalStatistics, setShowAdditionalStatistics] = useState(false);
  const chainName = useContestConfigStore(useShallow(state => state.contestConfig.chainName));

  const renderClaimStatus = () => {
    if (isActive) {
      return <p className="text-[12px] text-neutral-9">come back after contest ends to claim rewards!</p>;
    }

    const isClaimed = isRankClaimed(rank);
    const isLoading = isClaimLoading(rank, reward.address);
    const isSuccess = isClaimSuccess?.(rank, reward.address) || false;

    if (isClaimed || isSuccess) {
      return (
        <div className="flex gap-1 items-center leading-none">
          🎉
          <GradientText textSizeClassName="text-[12px]" isFontSabo={false}>
            rewards have been claimed!
          </GradientText>
        </div>
      );
    }

    return <RewardsClaimButton onClick={() => onClaim(rank, reward)} isLoading={isLoading} />;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <RewardsNumberDisplay
          value={reward.value}
          symbol={reward.symbol}
          decimals={reward.decimals}
          index={0}
          tokenAddress={peggedRewardTokenAddress(chainName, reward.address)}
          chainName={chainName}
        />
        {isAdditionalStatisticsSupported ? (
          <button onClick={() => setShowAdditionalStatistics(!showAdditionalStatistics)}>
            <ChevronDownIcon
              className={`w-6 h-6 text-positive-11 transition-transform duration-300 ease-in-out ${
                showAdditionalStatistics ? "rotate-180" : ""
              }`}
            />
          </button>
        ) : null}
      </div>
      <div className="flex flex-col gap-6">
        {showAdditionalStatistics ? (
          <VoterStatistics
            ranking={rank}
            myReward={{
              value: reward.value,
              symbol: reward.symbol,
              decimals: reward.decimals,
              address: reward.address,
            }}
            isActive={isActive}
          />
        ) : null}
        {renderClaimStatus()}
      </div>
    </div>
  );
};

export default RewardItem;
