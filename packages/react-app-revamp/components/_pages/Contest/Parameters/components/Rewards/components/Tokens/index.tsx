import { useTotalRewards } from "@hooks/useTotalRewards";
import useContestConfigStore from "@hooks/useContestConfig/store";
import useDisplayPrice from "@hooks/useCurrency/useDisplayPrice";
import { FC } from "react";
import { formatUnits } from "viem";
import Skeleton from "react-loading-skeleton";
import RewardsError from "@components/_pages/Contest/Rewards/modules/shared/Error";
import { RewardModuleInfo } from "lib/rewards/types";

const RewardAmount: FC<{ value: bigint; decimals: number; symbol: string; tokenAddress?: string }> = ({
  value,
  decimals,
  symbol,
  tokenAddress,
}) => {
  const { contestConfig } = useContestConfigStore(state => state);
  const nativeRaw = formatUnits(value, decimals);
  const { displayValue, displaySymbol } = useDisplayPrice(nativeRaw, symbol, tokenAddress, contestConfig.chainName);

  if (displaySymbol === "$") return <>${displayValue}</>;
  return <>{displayValue} {displaySymbol}</>;
};

interface RewardsParametersTokensProps {
  rewardsStore: RewardModuleInfo;
  chainId: number;
}

const RewardsParametersTokens: FC<RewardsParametersTokensProps> = ({ rewardsStore, chainId }) => {
  const {
    data: totalRewards,
    isLoading,
    isError,
    refetch,
  } = useTotalRewards({
    rewardsModuleAddress: rewardsStore.contractAddress as `0x${string}`,
    rewardsModuleAbi: rewardsStore.abi,
    chainId,
  });

  if (isLoading) {
    return (
      <li className="list-disc">
        <Skeleton width={300} height={16} baseColor="#6A6A6A" highlightColor="#BB65FF" duration={1} />
      </li>
    );
  }

  if (isError) {
    return <RewardsError onRetry={refetch} />;
  }

  if (totalRewards && !totalRewards.native.value && Object.keys(totalRewards.tokens).length === 0) {
    return null;
  }

  const renderRewardsList = () => {
    if (!totalRewards) return null;

    const allRewards = [
      {
        key: "native",
        value: totalRewards.native.value,
        decimals: totalRewards.native.decimals,
        symbol: totalRewards.native.symbol,
        tokenAddress: undefined,
      },
      ...Object.entries(totalRewards.tokens).map(([address, token]) => ({
        key: address,
        value: token.value,
        decimals: token.decimals,
        symbol: token.symbol,
        tokenAddress: address,
      })),
    ];

    return allRewards.map((reward, index) => (
      <span key={reward.key}>
        <RewardAmount
          value={reward.value}
          decimals={reward.decimals}
          symbol={reward.symbol}
          tokenAddress={reward.tokenAddress}
        />
        {index < allRewards.length - 1 && ", "}
      </span>
    ));
  };

  return <li className="list-disc">rewards pool has {renderRewardsList()}</li>;
};

export default RewardsParametersTokens;
