import { toFixedString } from "@helpers/formatBalance";
import { PriceCurveType } from "@hooks/useDeployContest/types";
import { calculateEndPriceForType } from "lib/priceCurve";
import { formatEther, parseEther } from "viem";

interface CalculateWinUpToParams {
  currentPricePerVote: bigint;
  costToVoteAtStart: bigint;
  spendingAmount: number;
  multiple: number;
  percentageToRewards: number;
  firstPlaceSharePercentage: number;
  submissionsCount: number;
  priceCurveType?: PriceCurveType;
}

export const calculateVotingRewardsProjection = ({
  currentPricePerVote,
  costToVoteAtStart,
  spendingAmount,
  multiple,
  percentageToRewards,
  firstPlaceSharePercentage,
  submissionsCount,
  priceCurveType = PriceCurveType.Exponential,
}: CalculateWinUpToParams): string => {
  if (!spendingAmount || spendingAmount <= 0 || currentPricePerVote <= 0n) return "0";

  const spendingAmountWei = parseEther(toFixedString(spendingAmount));
  const numberOfVotes = Math.floor(Number(spendingAmountWei) / Number(currentPricePerVote));

  if (numberOfVotes <= 0) return "0";

  const finalPricePerVoteWei = calculateEndPriceForType(priceCurveType, Number(costToVoteAtStart), multiple);
  const finalPricePerVote = Number(formatEther(finalPricePerVoteWei));

  const percentToPool = percentageToRewards / 100;
  const firstPlaceShare = firstPlaceSharePercentage / 100;

  const totalPoolProjection = finalPricePerVote * numberOfVotes * submissionsCount * percentToPool * firstPlaceShare;

  return toFixedString(totalPoolProjection);
};

export const validateVotingRewardsProjectionData = (
  percentageToRewards: number,
  firstPlaceSharePercentage: number,
  costToVote: bigint,
): boolean => {
  return Boolean(percentageToRewards && firstPlaceSharePercentage && costToVote > 0n);
};
