import usePriceCurveMultiple from "@hooks/usePriceCurveMultiple";
import { calculateStaticMinuteToMinutePercentage } from "lib/priceCurve";
import { useMemo } from "react";
import { Abi, formatEther } from "viem";

interface CurrentPricePercentageIncreaseParams {
  address: string;
  abi: Abi;
  chainId: number;
  costToVote: bigint;
  totalVotingMinutes: number;
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
  }, [costToVote, priceCurveMultiple, isMultipleLoading, totalVotingMinutes]);

  const isLoading = isMultipleLoading;
  const isError = isMultipleError;

  return {
    currentPricePercentageData,
    isLoading,
    isError,
  };
};

export default useCurrentPricePercentageIncrease;
