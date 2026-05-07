import useContestConfigStore from "@hooks/useContestConfig/store";
import { useContestVoteTimings } from "@hooks/useContestVoteTimings";
import { useCurrencyStore } from "@hooks/useCurrency/store";
import { convertToDisplayPrice } from "@hooks/useCurrency/useDisplayPrice";
import useNativeRates from "@hooks/useCurrency/useNativeRates";
import useCurrentPricePercentageIncrease from "@hooks/useCurrentPricePercentageIncrease";
import { PriceCurveType } from "@hooks/useDeployContest/types";
import usePriceCurveChartData from "@hooks/usePriceCurveChartData";
import usePriceCurveMultiple from "@hooks/usePriceCurveMultiple";
import usePriceCurvePoints from "@hooks/usePriceCurvePoints";
import usePriceCurveType from "@hooks/usePriceCurveType";
import usePriceCurveUpdateInterval from "@hooks/usePriceCurveUpdateInterval";
import { useCountdownTimer } from "@hooks/useTimer";
import { useParentSize } from "@visx/responsive";
import { useCallback, useEffect, useMemo } from "react";
import { useReadContract } from "wagmi";
import PriceCurve from "./index";
import usePriceCurveChartStore from "./store";
import { useShallow } from "zustand/shallow";

const DEFAULT_CHART_HEIGHT = 300;

interface PriceCurveWrapperProps {
  height?: number;
  showPriceWarning?: boolean;
  noPadding?: boolean;
  showAxisLabels?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const PriceCurveWrapper = ({
  height = DEFAULT_CHART_HEIGHT,
  showPriceWarning = false,
  noPadding = false,
  showAxisLabels = false,
  isExpanded,
  onToggleExpand,
}: PriceCurveWrapperProps) => {
  const { parentRef, width } = useParentSize({ debounceTime: 150 });
  const contestConfig = useContestConfigStore(useShallow(state => state.contestConfig));

  const {
    voteTimings,
    isLoading: isTimingsLoading,
    isError: isTimingsError,
  } = useContestVoteTimings({
    address: contestConfig.address,
    chainId: contestConfig.chainId,
    abi: contestConfig.abi,
  });

  const {
    data: costToVoteRaw,
    isLoading: isCostLoading,
    isError: isCostError,
  } = useReadContract({
    address: contestConfig.address,
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

  const displayCurrency = useCurrencyStore(state => state.displayCurrency);
  const { data: nativeRates } = useNativeRates();
  const endTime = useMemo(() => new Date(endTimeMs), [endTimeMs]);
  const votingTimeLeft = useCountdownTimer(endTime);

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

  const now = Date.now();
  const contestPhase: "before" | "during" | "after" =
    now < startTimeMs ? "before" : votingTimeLeft > 0 ? "during" : "after";

  const endPrice = chartData.length > 0 ? chartData[chartData.length - 1].pv : 0;
  const startPriceValue = chartData.length > 0 ? chartData[0].pv : 0;

  const formatPrice = useCallback(
    (nativePrice: number) => {
      const { displayValue, displaySymbol } = convertToDisplayPrice(
        nativePrice.toString(),
        contestConfig.chainNativeCurrencySymbol,
        displayCurrency,
        nativeRates ?? {},
      );
      return displaySymbol === "$" ? `$${displayValue}` : `${displayValue} ${displaySymbol}`;
    },
    [contestConfig.chainNativeCurrencySymbol, displayCurrency, nativeRates],
  );

  const setShowPriceUpdateWarning = usePriceCurveChartStore(useShallow(state => state.setShowPriceUpdateWarning));

  useEffect(() => {
    const shouldWarn = showPriceWarning && secondsUntilNextUpdate < 15 && votingTimeLeft > 60;
    setShowPriceUpdateWarning(shouldWarn);
  }, [showPriceWarning, secondsUntilNextUpdate, votingTimeLeft, setShowPriceUpdateWarning]);

  const isLoading = isTimingsLoading || isCostLoading || isMultipleLoading || isIntervalLoading || isPointsLoading;
  const isError = isTimingsError || isCostError || isMultipleError || isIntervalError || isPointsError;

  if (isLoading) {
    return <div ref={parentRef} style={{ height }} className="w-full animate-pulse rounded-lg bg-neutral-2" />;
  }

  if (isError || chartData.length === 0) {
    return <div ref={parentRef} />;
  }

  return (
    <div ref={parentRef} className="w-full animate-fade-in">
      <PriceCurve
        data={chartData}
        currentPrice={currentPrice}
        currentIndex={currentIndex}
        width={width}
        height={height}
        formatPrice={formatPrice}
        percentageIncrease={currentPricePercentageData?.percentageIncrease ?? null}
        isBelowThreshold={currentPricePercentageData?.isBelowThreshold ?? true}
        secondsUntilNextUpdate={secondsUntilNextUpdate}
        votingTimeLeft={votingTimeLeft}
        showPriceWarning={showPriceWarning}
        contestPhase={contestPhase}
        startPriceValue={startPriceValue}
        endPriceValue={endPrice}
        updateIntervalSeconds={priceCurveUpdateInterval}
        priceCurveType={priceCurveType}
        noPadding={noPadding}
        showAxisLabels={showAxisLabels}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
      />
    </div>
  );
};

export default PriceCurveWrapper;
