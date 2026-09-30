import { ChartDataPoint } from "@components/PriceCurve/types";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { useContestVoteTimings } from "@hooks/useContestVoteTimings";
import { PriceCurveType } from "@hooks/useDeployContest/types";
import { convertToChartData } from "@hooks/usePriceCurveChartData";
import usePriceCurveMultiple from "@hooks/usePriceCurveMultiple";
import usePriceCurvePoints from "@hooks/usePriceCurvePoints";
import usePriceCurveType from "@hooks/usePriceCurveType";
import usePriceCurveUpdateInterval from "@hooks/usePriceCurveUpdateInterval";
import { PricePoint } from "lib/priceCurve/types";
import { useMemo } from "react";
import { useReadContract } from "wagmi";
import { useShallow } from "zustand/shallow";

export interface PriceCurveConfig {
  pricePoints: PricePoint[];
  chartData: ChartDataPoint[];
  startPrice: number;
  priceCurveType: PriceCurveType;
  priceCurveUpdateInterval: number;
  startTimeMs: number;
  endTimeMs: number;
  totalVotingMinutes: number;
  isLoading: boolean;
  isError: boolean;
}

const usePriceCurveConfig = (): PriceCurveConfig => {
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

  const chartData = useMemo(() => convertToChartData(pricePoints), [pricePoints]);

  return {
    pricePoints,
    chartData,
    startPrice,
    priceCurveType,
    priceCurveUpdateInterval,
    startTimeMs,
    endTimeMs,
    totalVotingMinutes,
    isLoading: isTimingsLoading || isCostLoading || isMultipleLoading || isIntervalLoading || isPointsLoading,
    isError: isTimingsError || isCostError || isMultipleError || isIntervalError || isPointsError,
  };
};

export default usePriceCurveConfig;
