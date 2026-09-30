import { useNativePriceFormatter } from "@hooks/useNativePriceFormatter";
import { useNextPriceUpdate } from "@hooks/useNextPriceUpdate";
import { usePriceUpdateWarning } from "@hooks/useNextPriceUpdate/usePriceUpdateWarning";
import usePriceCurveData from "@hooks/usePriceCurveData";
import { useResolvedVoteEvents } from "@hooks/useResolvedVoteEvents";
import { useParentSize } from "@visx/responsive";
import { PriceCurveHeaderTone } from "./components/Header/constants";
import { HEADER_HEIGHT } from "./constants";
import PriceCurve from "./index";
import { ChartPadding } from "./types";

const DEFAULT_CHART_HEIGHT = 300;

interface PriceCurveWrapperProps {
  height?: number;
  showPriceWarning?: boolean;
  noPadding?: boolean;
  showAxisLabels?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  showVoterRibbon?: boolean;
  headerTone?: PriceCurveHeaderTone;
  chartPadding?: ChartPadding;
}

const PriceCurveWrapper = ({
  height = DEFAULT_CHART_HEIGHT,
  showPriceWarning = false,
  noPadding = false,
  showAxisLabels = false,
  isExpanded,
  onToggleExpand,
  showVoterRibbon = true,
  headerTone,
  chartPadding,
}: PriceCurveWrapperProps) => {
  const { parentRef, width } = useParentSize({ debounceTime: 150 });
  const { chartData, currentPrice, currentIndex, priceCurveType, priceCurveUpdateInterval, isLoading, isError } =
    usePriceCurveData();
  const { voteEvents, rankById, entryTitlesById } = useResolvedVoteEvents();
  const nextPriceUpdate = useNextPriceUpdate();
  usePriceUpdateWarning(nextPriceUpdate, showPriceWarning);
  const formatPrice = useNativePriceFormatter();

  const endPrice = chartData.length > 0 ? chartData[chartData.length - 1].pv : 0;
  const startPriceValue = chartData.length > 0 ? chartData[0].pv : 0;

  if (isLoading) {
    const skeletonHeight = isExpanded === false ? HEADER_HEIGHT : height;
    return (
      <div
        ref={parentRef}
        style={{ height: skeletonHeight }}
        className="w-full animate-pulse rounded-lg bg-neutral-2"
      />
    );
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
        formatHeaderPrice={nativePrice => formatPrice(nativePrice, { ceilingPrecision: true })}
        percentageIncrease={nextPriceUpdate.percentage?.percentageIncrease ?? null}
        isBelowThreshold={nextPriceUpdate.percentage?.isBelowThreshold ?? true}
        secondsUntilNextUpdate={nextPriceUpdate.secondsUntilNextUpdate}
        votingTimeLeft={nextPriceUpdate.votingTimeLeft}
        showPriceWarning={showPriceWarning}
        contestPhase={nextPriceUpdate.phase}
        startPriceValue={startPriceValue}
        endPriceValue={endPrice}
        updateIntervalSeconds={priceCurveUpdateInterval}
        priceCurveType={priceCurveType}
        noPadding={noPadding}
        showAxisLabels={showAxisLabels}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
        showVoterRibbon={showVoterRibbon}
        headerTone={headerTone}
        chartPadding={chartPadding}
        voteEvents={voteEvents}
        entryTitlesById={entryTitlesById}
        rankById={rankById}
      />
    </div>
  );
};

export default PriceCurveWrapper;
