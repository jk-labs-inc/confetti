import { toFixedString } from "@helpers/formatBalance";
import { calculateEndPrice } from "lib/priceCurve";
import { formatEther, parseEther } from "viem";

interface CalculateWinUpToParams {
  currentPricePerVote: bigint;
  costToVoteAtStart: bigint;
  spendingAmount: number;
  multiple: number;
  percentageToRewards: number;
  firstPlaceSharePercentage: number;
  submissionsCount: number;
}

export const calculateVotingRewardsProjection = ({
  currentPricePerVote,
  costToVoteAtStart,
  spendingAmount,
  multiple,
  percentageToRewards,
  firstPlaceSharePercentage,
  submissionsCount,
}: CalculateWinUpToParams): string => {
  if (!spendingAmount || spendingAmount <= 0 || currentPricePerVote <= 0n) return "0";

  const spendingAmountWei = parseEther(toFixedString(spendingAmount));

  // Calculate number of votes user is buying at current price (in wei)
  const numberOfVotes = Math.floor(Number(spendingAmountWei) / Number(currentPricePerVote));

  if (numberOfVotes <= 0) return "0";

  // Calculate final price per vote (end of exponential curve) - returns bigint in wei
  const finalPricePerVoteWei = calculateEndPrice(Number(costToVoteAtStart), multiple);

  // Convert final price to ETH for calculation
  const finalPricePerVote = Number(formatEther(finalPricePerVoteWei));

  // Formula: (1st place %) × (% to pool) × (final price per vote) × (votes) × (total entries)
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
