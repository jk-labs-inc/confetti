import usePriceCurveMultiple from "@hooks/usePriceCurveMultiple";
import { PriceCurveType } from "@hooks/useDeployContest/types";
import { calculateDynamicLogPercentage, calculateStaticMinuteToMinutePercentage } from "lib/priceCurve";
import { useMemo } from "react";
import { Abi, formatEther } from "viem";

interface CurrentPricePercentageIncreaseParams {
  address: string;
  abi: Abi;
  chainId: number;
  costToVote: bigint;
  totalVotingMinutes: number;
  priceCurveType?: PriceCurveType;
  votingTimeLeft?: number; // seconds remaining; required for logarithmic dynamic computation
  enabled?: boolean;
}

interface CurrentPricePercentageIncreaseResponse {
  currentPricePercentageData: { percentageIncrease: number; isBelowThreshold: boolean } | null;
  isLoading: boolean;
  isError: boolean;
}

const useCurrentPricePercentageIncrease = ({
  address,
  abi,
  chainId,
  enabled = true,
  costToVote,
  totalVotingMinutes,
  priceCurveType = PriceCurveType.Exponential,
  votingTimeLeft = 0,
}: CurrentPricePercentageIncreaseParams): CurrentPricePercentageIncreaseResponse => {
  const {
    priceCurveMultiple,
    isLoading: isMultipleLoading,
    isError: isMultipleError,
  } = usePriceCurveMultiple({
    address,
    abi,
    chainId,
    enabled,
  });

  const currentPricePercentageData = useMemo(() => {
    if (!costToVote || !priceCurveMultiple || isMultipleLoading || totalVotingMinutes <= 0) {
      return null;
    }

    try {
      const multiple = Number(priceCurveMultiple);
      const costToVoteNumber = Number(formatEther(costToVote));

      if (priceCurveType === PriceCurveType.Logarithmic) {
        const minutesLeft = Math.max(0, Math.floor(votingTimeLeft / 60));
        const elapsedMinutes = Math.max(0, totalVotingMinutes - minutesLeft);
        return calculateDynamicLogPercentage(Number(costToVote), multiple, totalVotingMinutes, elapsedMinutes);
      }

      const { percentageIncrease, isBelowThreshold } = calculateStaticMinuteToMinutePercentage(
        costToVoteNumber,
        multiple,
        totalVotingMinutes,
      );

      return { percentageIncrease, isBelowThreshold };
    } catch (error) {
      console.error("error", error);
      return null;
    }
  }, [costToVote, priceCurveMultiple, isMultipleLoading, totalVotingMinutes, priceCurveType, votingTimeLeft]);

  const isLoading = isMultipleLoading;
  const isError = isMultipleError;

  return {
    currentPricePercentageData,
    isLoading,
    isError,
  };
};

export default useCurrentPricePercentageIncrease;
