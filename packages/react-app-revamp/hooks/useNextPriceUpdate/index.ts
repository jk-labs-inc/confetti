import useContestConfigStore from "@hooks/useContestConfig/store";
import useCurrentPricePercentageIncrease from "@hooks/useCurrentPricePercentageIncrease";
import usePriceCurveConfig from "@hooks/usePriceCurveConfig";
import { useCountdownTimer } from "@hooks/useTimer";
import { useMemo } from "react";
import { useShallow } from "zustand/shallow";

export type PriceCurvePhase = "before" | "during" | "after";

export interface PricePercentage {
  percentageIncrease: number;
  isBelowThreshold: boolean;
}

export interface NextPriceUpdate {
  secondsUntilNextUpdate: number;
  votingTimeLeft: number;
  percentage: PricePercentage | null;
  phase: PriceCurvePhase;
  updateIntervalSeconds: number;
  isLoading: boolean;
}

export const useNextPriceUpdate = (): NextPriceUpdate => {
  const contestConfig = useContestConfigStore(useShallow(state => state.contestConfig));
  const {
    startPrice,
    priceCurveType,
    priceCurveUpdateInterval,
    startTimeMs,
    endTimeMs,
    totalVotingMinutes,
    isLoading,
  } = usePriceCurveConfig();
  const endTime = useMemo(() => new Date(endTimeMs), [endTimeMs]);
  const votingTimeLeft = useCountdownTimer(endTime);

  const { currentPricePercentageData } = useCurrentPricePercentageIncrease({
    address: contestConfig.address,
    abi: contestConfig.abi,
    chainId: contestConfig.chainId,
    costToVote: BigInt(startPrice),
    totalVotingMinutes,
    priceCurveType,
    votingTimeLeft,
  });

  const secondsUntilNextUpdate = priceCurveUpdateInterval > 0 ? votingTimeLeft % priceCurveUpdateInterval : 0;
  const phase: PriceCurvePhase = Date.now() < startTimeMs ? "before" : votingTimeLeft > 0 ? "during" : "after";

  return {
    secondsUntilNextUpdate,
    votingTimeLeft,
    percentage: currentPricePercentageData,
    phase,
    updateIntervalSeconds: priceCurveUpdateInterval,
    isLoading,
  };
};

export default useNextPriceUpdate;
