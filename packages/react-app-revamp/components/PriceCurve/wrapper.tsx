import useContestConfigStore from "@hooks/useContestConfig/store";
import { useCurrencyStore } from "@hooks/useCurrency/store";
import { convertToDisplayPrice } from "@hooks/useCurrency/useDisplayPrice";
import useNativeRates from "@hooks/useCurrency/useNativeRates";
import useCurrentPricePercentageIncrease from "@hooks/useCurrentPricePercentageIncrease";
import usePriceCurveData from "@hooks/usePriceCurveData";
import { useCountdownTimer } from "@hooks/useTimer";
import { useParentSize } from "@visx/responsive";
import { useCallback, useEffect, useMemo } from "react";
import { useShallow } from "zustand/shallow";
import PriceCurve from "./index";
import usePriceCurveChartStore from "./store";

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
  const displayCurrency = useCurrencyStore(state => state.displayCurrency);
  const { data: nativeRates } = useNativeRates();

  const {
    chartData,
    currentPrice,
    currentIndex,
    startPrice,
    priceCurveType,
    priceCurveUpdateInterval,
    startTimeMs,
    endTimeMs,
    totalVotingMinutes,
    isLoading,
    isError,
  } = usePriceCurveData();

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
