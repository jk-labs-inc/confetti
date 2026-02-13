import DualPriceDisplay from "@components/UI/DualPriceDisplay";
import { extractPathSegments } from "@helpers/extractPath";

import { getChainId } from "@helpers/getChainId";
import useDisplayPrice from "@hooks/useCurrency/useDisplayPrice";
import useRewardsModule from "@hooks/useRewards";
import { useTotalRewardsForRank } from "@hooks/useTotalRewardsForRank";
import { useVoterRewardsStatistics } from "@hooks/useVoterRewardsStatistics";
import { usePathname } from "next/navigation";
import { FC } from "react";
import { formatUnits } from "viem";
import RewardsError from "../../../../shared/Error";
import RankingSuffix from "./components/RankingSuffix";
import StatisticsRow from "./components/StatisticsRow";
import StatisticsSkeleton from "./components/StatisticsSkeleton";
import VotesInfo from "./components/VotesInfo";

interface TokenRewardDisplayProps {
  formatted: string;
  symbol: string;
  address: string;
  chainName: string;
}

const TokenRewardDisplay: FC<TokenRewardDisplayProps> = ({ formatted, symbol, address, chainName }) => {
  const { displayValue, displaySymbol } = useDisplayPrice(formatted, symbol, address, chainName);

  return (
    <span>
      <DualPriceDisplay
        displayValue={displayValue}
        displaySymbol={displaySymbol}
        secondaryValue={null}
        secondarySymbol={null}
      />
    </span>
  );
};

interface VoterStatisticsProps {
  ranking: number;
  myReward: {
    value: bigint;
    symbol: string;
    decimals: number;
  };
  isActive: boolean;
}

const VoterStatistics: FC<VoterStatisticsProps> = ({ ranking, myReward, isActive }) => {
  const asPath = usePathname();
  const { address: contestAddress, chainName } = extractPathSegments(asPath);
  const chainId = getChainId(chainName);
  const { data: rewards } = useRewardsModule();
  const {
    statistics,
    isLoading,
    isError,
    refetch: refetchStatistics,
  } = useVoterRewardsStatistics(contestAddress, rewards?.contractAddress as `0x${string}`, ranking, chainId ?? 0);

  const {
    data: totalRewardsForRank,
    isLoading: isTotalRewardsForRankLoading,
    isError: isTotalRewardsForRankError,
    refetch: refetchTotalRewardsForRank,
  } = useTotalRewardsForRank({
    rewardsModuleAddress: rewards?.contractAddress as `0x${string}`,
    rewardsModuleAbi: rewards?.abi ?? [],
    chainId: chainId ?? 0,
    ranking,
  });

  const nativeRewardRaw = totalRewardsForRank?.native.formatted ?? "0";
  const nativeRewardDisplay = useDisplayPrice(nativeRewardRaw, totalRewardsForRank?.native.symbol ?? "ETH");

  const myRewardRaw = formatUnits(myReward.value, myReward.decimals);
  const myRewardDisplay = useDisplayPrice(myRewardRaw, myReward.symbol);

  if (isLoading || isTotalRewardsForRankLoading) return <StatisticsSkeleton />;

  if (isError || isTotalRewardsForRankError)
    return <RewardsError onRetry={isError ? refetchStatistics : refetchTotalRewardsForRank} />;

  const renderTotalRewards = () => (
    <div className="flex flex-col items-end font-bold">
      <span>
        <DualPriceDisplay
          displayValue={nativeRewardDisplay.displayValue}
          displaySymbol={nativeRewardDisplay.displaySymbol}
          secondaryValue={null}
          secondarySymbol={null}
        />
      </span>
      {Object.entries(totalRewardsForRank?.tokens ?? {}).map(([address, token]) => (
        <TokenRewardDisplay
          key={address}
          formatted={token.formatted ?? "0"}
          symbol={token.symbol}
          address={address}
          chainName={chainName}
        />
      ))}
    </div>
  );

  return (
    <div className="flex flex-col w-full text-neutral-9 gap-2 mt-4">
      <StatisticsRow
        label={<RankingSuffix ranking={ranking} text="place voter rewards" />}
        value={renderTotalRewards()}
      />

      <VotesInfo ranking={ranking} info={statistics} isActive={isActive} />

      {statistics && (
        <StatisticsRow
          label={<RankingSuffix ranking={ranking} text="place rewards" prefix="my" />}
          value={
            <b>
              <DualPriceDisplay
                displayValue={myRewardDisplay.displayValue}
                displaySymbol={myRewardDisplay.displaySymbol}
                secondaryValue={null}
                secondarySymbol={null}
              />
            </b>
          }
          isLast={true}
          bold={true}
        />
      )}
    </div>
  );
};

export default VoterStatistics;
