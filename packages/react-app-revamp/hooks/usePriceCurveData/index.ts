import { ChartDataPoint } from "@components/PriceCurve/types";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { useContestVoteTimings } from "@hooks/useContestVoteTimings";
import { PriceCurveType } from "@hooks/useDeployContest/types";
import usePriceCurveChartData from "@hooks/usePriceCurveChartData";
import usePriceCurveMultiple from "@hooks/usePriceCurveMultiple";
import usePriceCurvePoints from "@hooks/usePriceCurvePoints";
import usePriceCurveType from "@hooks/usePriceCurveType";
import usePriceCurveUpdateInterval from "@hooks/usePriceCurveUpdateInterval";
import { useReadContract } from "wagmi";
import { useShallow } from "zustand/shallow";

interface UsePriceCurveDataReturn {
  chartData: ChartDataPoint[];
  currentPrice: number;
  currentPriceNative: string;
  currentIndex: number;
  startPrice: number;
  priceCurveType: PriceCurveType;
  priceCurveUpdateInterval: number;
  startTimeMs: number;
  endTimeMs: number;
  totalVotingMinutes: number;
  isLoading: boolean;
  isError: boolean;
}

// Single source of truth for the price-curve interpolated state.
// `currentPrice` matches the value shown in the chart header.
// Underlying contract reads are deduped by wagmi's React Query cache.
const usePriceCurveData = (): UsePriceCurveDataReturn => {
  const contestConfig = useContestConfigStore(useShallow(state => state.contestConfig));

  const {
    voteTimings,
    isLoading: isTimingsLoading,
    isError: isTimingsError,
  } = useContestVoteTimings({
    address: contestConfig.address as `0x${string}`,
    chainId: contestConfig.chainId,
    abi: contestConfig.abi,
  });

  const {
    data: costToVoteRaw,
    isLoading: isCostLoading,
    isError: isCostError,
  } = useReadContract({
    address: contestConfig.address as `0x${string}`,
    chainId: contestConfig.chainId,
    abi: contestConfig.abi,
    functionName: "costToVote",
    query: { staleTime: Infinity },
  });

  const startPrice = Number(costToVoteRaw ?? 0);
  const voteStartSec = voteTimings ? Number(voteTimings.voteStart) : 0;
  const contestDeadlineSec = voteTimings ? Number(voteTimings.contestDeadline) : 0;
  const startTimeMs = voteStartSec * 1000 + 1000;
  const endTimeMs = contestDeadlineSec * 1000 + 1000;
  const totalVotingMinutes = voteTimings ? Math.floor((contestDeadlineSec - voteStartSec) / 60) : 0;

  const {
    priceCurveMultiple,
    isLoading: isMultipleLoading,
    isError: isMultipleError,
  } = usePriceCurveMultiple({
    address: contestConfig.address,
    abi: contestConfig.abi,
    chainId: contestConfig.chainId,
  });

  const {
    priceCurveUpdateInterval,
    isLoading: isIntervalLoading,
    isError: isIntervalError,
  } = usePriceCurveUpdateInterval({
    address: contestConfig.address,
    abi: contestConfig.abi,
    chainId: contestConfig.chainId,
  });

  const { priceCurveType } = usePriceCurveType({
    address: contestConfig.address,
    abi: contestConfig.abi,
    chainId: contestConfig.chainId,
    version: contestConfig.version,
  });

  const {
    pricePoints,
    isLoading: isPointsLoading,
    isError: isPointsError,
  } = usePriceCurvePoints({
    startPrice,
    multiple: Number(priceCurveMultiple),
    startTimeMs,
    endTimeMs,
    updateIntervalSeconds: priceCurveUpdateInterval,
    priceCurveType,
    enabled:
      !isTimingsLoading &&
      !isTimingsError &&
      !isCostLoading &&
      !isCostError &&
      !!voteTimings &&
      startPrice > 0 &&
      !isMultipleLoading &&
      !isMultipleError &&
      !!priceCurveMultiple &&
      !!priceCurveUpdateInterval &&
      !isIntervalLoading &&
      !isIntervalError,
  });

  const { chartData, currentPrice, currentIndex } = usePriceCurveChartData({ pricePoints });

  const currentPriceNative =
    currentIndex >= 0 && currentIndex < pricePoints.length
      ? pricePoints[currentIndex].price
      : (pricePoints[0]?.price ?? "0");

  const isLoading = isTimingsLoading || isCostLoading || isMultipleLoading || isIntervalLoading || isPointsLoading;
  const isError = isTimingsError || isCostError || isMultipleError || isIntervalError || isPointsError;

  return {
    chartData,
    currentPrice,
    currentPriceNative,
    currentIndex,
    startPrice,
    priceCurveType,
    priceCurveUpdateInterval,
    startTimeMs,
    endTimeMs,
    totalVotingMinutes,
    isLoading,
    isError,
  };
};

export default usePriceCurveData;
