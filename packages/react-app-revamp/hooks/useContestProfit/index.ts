import useTotalSpentByAddress from "@hooks/useTotalSpentByAddress";
import useUserRewards from "@hooks/useUserRewards";
import { useContestStore } from "@hooks/useContest/store";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { ContestStatus, useContestStatusStore } from "@hooks/useContestStatus/store";
import { useWallet } from "@hooks/useWallet";
import { RewardModuleInfo } from "lib/rewards/types";
import { useMemo, useCallback } from "react";
import { useShallow } from "zustand/shallow";
import { ContestProfitData } from "./types";

interface UseContestProfitParams {
  contestAddress: `0x${string}`;
  chainId: number;
  rewards: RewardModuleInfo;
}

const EMPTY_PROFIT_DATA: ContestProfitData = {
  isAnalyticsSupported: false,
  profitPercentage: 0,
  isInProfit: false,
  isLoading: false,
  isError: false,
  refetch: () => {},
};

const calculateProfitPercentage = (rewards: bigint, spent: bigint): number => {
  if (spent === 0n) return 0;

  const profitBps = ((rewards - spent) * 10000n) / spent;
  return Number(profitBps) / 100;
};

const useContestProfit = ({ contestAddress, chainId, rewards }: UseContestProfitParams): ContestProfitData => {
  const { userAddress } = useWallet();
  const contestAuthorEthereumAddress = useContestStore(useShallow(state => state.contestAuthorEthereumAddress));
  const version = useContestConfigStore(useShallow(state => state.contestConfig.version));
  const contestStatus = useContestStatusStore(useShallow(state => state.contestStatus));

  const {
    totalSpent,
    isAnalyticsSupported,
    isLoading: isSpentLoading,
    isError: isSpentError,
    refetch: refetchSpent,
  } = useTotalSpentByAddress({
    contestAddress,
    chainId,
    userAddress,
  });

  const {
    totalRewards,
    isLoading: isRewardsLoading,
    isError: isRewardsError,
    refetch: refetchRewards,
  } = useUserRewards({
    contractAddress: rewards.contractAddress as `0x${string}`,
    chainId,
    abi: rewards.abi,
    userAddress: userAddress as `0x${string}`,
    rankings: rewards.payees,
    creatorAddress: contestAuthorEthereumAddress as `0x${string}`,
    claimedEnabled: contestStatus === ContestStatus.VotingClosed,
    version,
  });

  const nativeTokenRewards = useMemo(() => {
    let nativeTotal = 0n;

    for (const reward of totalRewards) {
      if (reward.address === "native") {
        nativeTotal += reward.value;
      }
    }

    return nativeTotal;
  }, [totalRewards]);

  const profitPercentage = calculateProfitPercentage(nativeTokenRewards, totalSpent);
  const isInProfit = nativeTokenRewards > totalSpent;

  const refetch = useCallback(() => {
    refetchSpent();
    refetchRewards();
  }, [refetchSpent, refetchRewards]);

  if (!isAnalyticsSupported) return EMPTY_PROFIT_DATA;

  return {
    isAnalyticsSupported,
    profitPercentage,
    isInProfit,
    isLoading: isSpentLoading || isRewardsLoading,
    isError: isSpentError || isRewardsError,
    refetch,
  };
};

export default useContestProfit;
