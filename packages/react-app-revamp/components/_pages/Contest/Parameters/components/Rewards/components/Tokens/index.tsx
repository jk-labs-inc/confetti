import { useTotalRewards } from "@hooks/useTotalRewards";
import useContestConfigStore from "@hooks/useContestConfig/store";
import useRewardDisplayPrice from "@hooks/useRewards/useRewardDisplayPrice";
import { FC } from "react";
import { formatUnits } from "viem";
import Skeleton from "react-loading-skeleton";
import RewardsError from "@components/_pages/Contest/Rewards/modules/shared/Error";
import { isPotUnfunded } from "lib/rewards/pot";
import { RewardModuleInfo } from "lib/rewards/types";
import { chainHasNativeCoin } from "lib/voteCurrency";

const RewardAmount: FC<{ value: bigint; decimals: number; symbol: string; tokenAddress?: string }> = ({
  value,
  decimals,
  symbol,
  tokenAddress,
}) => {
  const { contestConfig } = useContestConfigStore(state => state);
  const nativeRaw = formatUnits(value, decimals);
  const { displayValue, displaySymbol, isLoading } = useRewardDisplayPrice(
    nativeRaw,
    symbol,
    tokenAddress,
    contestConfig.chainName,
  );

  if (isLoading) return <Skeleton width={60} height={16} baseColor="#706f78" highlightColor="#FFE25B" inline />;
  if (displaySymbol === "$") return <>${displayValue}</>;
  return (
    <span className="uppercase">
      {displayValue} {displaySymbol}
    </span>
  );
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

  if (totalRewards && isPotUnfunded(chainId, totalRewards)) {
    return null;
  }

  const renderRewardsList = () => {
    if (!totalRewards) return null;

    const nativeRewards = chainHasNativeCoin(chainId)
      ? [
          {
            key: "native",
            value: totalRewards.native.value,
            decimals: totalRewards.native.decimals,
            symbol: totalRewards.native.symbol,
            tokenAddress: undefined,
          },
        ]
      : [];

    const allRewards = [
      ...nativeRewards,
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
