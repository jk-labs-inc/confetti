import { PriceCurveType } from "@hooks/useDeployContest/types";
import { calculateEndPriceForType } from "lib/priceCurve";
import { formatEther } from "viem";
import { WinUpToParams } from "./types";

/**
 * best-case winnings: every entry ends up bought to the end-of-curve price and the
 * user's entry takes 1st. Native units.
 */
export const calculateWinUpTo = ({
  newVotes,
  costToVoteAtStart,
  multiple,
  percentageToRewards,
  firstPlaceSharePercentage,
  submissionsCount,
  priceCurveType = PriceCurveType.Exponential,
}: WinUpToParams): number => {
  if (newVotes <= 0) return 0;

  const finalPricePerVoteWei = calculateEndPriceForType(priceCurveType, Number(costToVoteAtStart), multiple);
  const finalPricePerVote = Number(formatEther(finalPricePerVoteWei));

  return (
    finalPricePerVote * newVotes * submissionsCount * (percentageToRewards / 100) * (firstPlaceSharePercentage / 100)
  );
};

export const validateWinUpToData = (
  percentageToRewards: number,
  firstPlaceSharePercentage: number,
  costToVote: bigint,
): boolean => {
  return Boolean(percentageToRewards && firstPlaceSharePercentage && costToVote > 0n);
};
