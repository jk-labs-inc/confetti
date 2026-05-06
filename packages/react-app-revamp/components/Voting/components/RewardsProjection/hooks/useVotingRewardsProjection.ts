import useRewardsModule from "@hooks/useRewards";
import { useContestPricingData } from "./useContestPricingData";
import { calculateVotingRewardsProjection, validateVotingRewardsProjectionData } from "./utils";

interface UseVotingRewardsProjectionReturn {
  winUpToFormatted: string;
  isLoading: boolean;
  shouldShow: boolean;
}

interface UseVotingRewardsProjectionParams {
  currentPricePerVote: bigint;
  inputValue: string;
  submissionsCount: number;
}

export const useVotingRewardsProjection = ({
  currentPricePerVote,
  inputValue,
  submissionsCount,
}: UseVotingRewardsProjectionParams): UseVotingRewardsProjectionReturn => {
  const {
    data: rewards,
    isLoading: isLoadingRewards,
    isSuccess: isSuccessRewards,
    isError: isErrorRewards,
  } = useRewardsModule();

  const {
    percentageToRewards,
    costToVote,
    multiple,
    priceCurveType,
    isLoading: isLoadingPricing,
    isError: isErrorPricing,
  } = useContestPricingData();

  const isLoading = isLoadingRewards || isLoadingPricing;
  const isError = isErrorRewards || isErrorPricing;

  if (isLoading || isError || !isSuccessRewards || !rewards) {
    return { winUpToFormatted: "0", isLoading, shouldShow: false };
  }

  if (!rewards.isSelfFunded || submissionsCount === 0) {
    return { winUpToFormatted: "0", isLoading: false, shouldShow: false };
  }

  const firstPlaceShareAmount = rewards.payeeShares.length > 0 ? rewards.payeeShares[0] : 0;
  const firstPlaceSharePercentage = rewards.totalShares > 0 ? (firstPlaceShareAmount / rewards.totalShares) * 100 : 0;

  if (!validateVotingRewardsProjectionData(percentageToRewards, firstPlaceSharePercentage, costToVote)) {
    return { winUpToFormatted: "0", isLoading: false, shouldShow: false };
  }

  const spendingAmount = parseFloat(inputValue) || 0;

  const winUpToFormatted = calculateVotingRewardsProjection({
    currentPricePerVote,
    spendingAmount,
    costToVoteAtStart: costToVote,
    multiple,
    percentageToRewards,
    firstPlaceSharePercentage,
    submissionsCount,
    priceCurveType,
  });

  return {
    winUpToFormatted,
    isLoading: false,
    shouldShow: true,
  };
};
