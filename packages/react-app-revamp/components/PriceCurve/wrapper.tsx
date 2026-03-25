import useContestConfigStore from "@hooks/useContestConfig/store";
import { useContestVoteTimings } from "@hooks/useContestVoteTimings";
import { useCurrencyStore } from "@hooks/useCurrency/store";
import { convertToDisplayPrice } from "@hooks/useCurrency/useDisplayPrice";
import useNativeRates from "@hooks/useCurrency/useNativeRates";
import useCurrentPricePercentageIncrease from "@hooks/useCurrentPricePercentageIncrease";
import usePriceCurveChartData from "@hooks/usePriceCurveChartData";
import usePriceCurveMultiple from "@hooks/usePriceCurveMultiple";
import usePriceCurvePoints from "@hooks/usePriceCurvePoints";
import usePriceCurveUpdateInterval from "@hooks/usePriceCurveUpdateInterval";
import { useCountdownTimer } from "@hooks/useTimer";
import { useParentSize } from "@visx/responsive";
import { useCallback, useEffect } from "react";
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
}

const PriceCurveWrapper = ({
  height = DEFAULT_CHART_HEIGHT,
  showPriceWarning = false,
  noPadding = false,
  showAxisLabels = false,
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
  const startTime = voteTimings ? new Date(Number(voteTimings.voteStart) * 1000 + 1000) : new Date();
  const endTime = voteTimings ? new Date(Number(voteTimings.contestDeadline) * 1000 + 1000) : new Date();
  const totalVotingMinutes = voteTimings
    ? Math.floor((Number(voteTimings.contestDeadline) - Number(voteTimings.voteStart)) / 60)
    : 0;

  const displayCurrency = useCurrencyStore(state => state.displayCurrency);
  const { data: nativeRates } = useNativeRates();
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

  const {
    pricePoints,
    isLoading: isPointsLoading,
    isError: isPointsError,
  } = usePriceCurvePoints({
    startPrice,
    multiple: Number(priceCurveMultiple),
    startTime,
    endTime,
    updateIntervalSeconds: priceCurveUpdateInterval,
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
  });

  const secondsUntilNextUpdate = priceCurveUpdateInterval > 0 ? votingTimeLeft % priceCurveUpdateInterval : 0;

  const now = Date.now();
  const contestPhase: "before" | "during" | "after" =
    now < startTime.getTime() ? "before" : votingTimeLeft > 0 ? "during" : "after";

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
        noPadding={noPadding}
        showAxisLabels={showAxisLabels}
      />
    </div>
  );
};

export default PriceCurveWrapper;
