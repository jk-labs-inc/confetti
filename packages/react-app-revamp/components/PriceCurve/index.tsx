import { PriceCurveType } from "@hooks/useDeployContest/types";
import { ContestVoteEvent } from "@hooks/useContestVoteMarkers";
import AnimatedDot from "./components/AnimatedDot";
import AxisLabels from "./components/AxisLabels";
import ConfettiParticles from "./components/ConfettiParticles";
import GridLines from "./components/GridLines";
import PriceCurveHeader from "./components/Header";
import HoverOverlay from "./components/HoverOverlay";
import VoterAvatarStrip from "./components/VoterMarkers";
import VoterAvatarTooltip from "./components/VoterMarkers/VoterAvatarTooltip";
import { buildAvatarClusters } from "./components/VoterMarkers/buildAvatarClusters";
import { AVATAR_LANE_HEIGHT, AVATAR_LANE_TOP_GAP, AVATAR_RADIUS } from "./components/VoterMarkers/constants";
import {
  CARD_PADDING,
  CARD_PADDING_STYLE,
  CHART_CONFIG,
  CHART_PADDING,
  CHART_PADDING_WITH_LABELS,
  NO_PADDING,
  HEADER_HEIGHT,
  SVG_OVERFLOW_STYLE,
  TOUCH_PAN_STYLE,
} from "./constants";
import { useChartInteraction } from "./hooks/useChartInteraction";
import { useChartScales } from "./hooks/useChartScales";
import { ChartDataPoint } from "./types";
import { curveMonotoneX } from "@visx/curve";
import { Group } from "@visx/group";
import { LinePath } from "@visx/shape";
import { FC, useMemo, useRef } from "react";

interface PriceCurveProps {
  data: ChartDataPoint[];
  currentPrice: number;
  currentIndex: number;
  width: number;
  height: number;
  formatPrice: (nativePrice: number) => string;
  formatHeaderPrice?: (nativePrice: number) => string;
  percentageIncrease: number | null;
  isBelowThreshold: boolean;
  secondsUntilNextUpdate: number;
  votingTimeLeft: number;
  showPriceWarning?: boolean;
  contestPhase: "before" | "during" | "after";
  startPriceValue: number;
  endPriceValue: number;
  updateIntervalSeconds: number;
  priceCurveType?: PriceCurveType;
  noPadding?: boolean;
  showAxisLabels?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  voteEvents?: ContestVoteEvent[];
  entryTitlesById?: Map<string, string>;
}

const EMPTY_ENTRY_TITLES: Map<string, string> = new Map();

const PriceCurve: FC<PriceCurveProps> = ({
  data,
  currentPrice,
  currentIndex,
  width,
  height,
  formatPrice,
  formatHeaderPrice,
  percentageIncrease,
  isBelowThreshold,
  secondsUntilNextUpdate,
  contestPhase,
  startPriceValue,
  endPriceValue,
  updateIntervalSeconds,
  priceCurveType = PriceCurveType.Exponential,
  noPadding = false,
  showAxisLabels = false,
  isExpanded,
  onToggleExpand,
  voteEvents = [],
  entryTitlesById = EMPTY_ENTRY_TITLES,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const pad = noPadding ? NO_PADDING : CARD_PADDING;
  const chartPad = showAxisLabels ? CHART_PADDING_WITH_LABELS : CHART_PADDING;
  const svgWidth = width - pad.left - pad.right;
  const svgHeight = height - pad.top - HEADER_HEIGHT - pad.bottom;
  const chartWidth = svgWidth - chartPad.left - chartPad.right;
  const chartHeight = svgHeight - chartPad.top - chartPad.bottom;

  // The main (axis-labelled) chart reserves a lane below the line for the voter-avatar strip — but
  // only once there are votes to show, so an empty contest doesn't render a blank gap.
  const showVoterLane = showAxisLabels && voteEvents.length > 0;
  const bottomInset = showVoterLane ? AVATAR_LANE_HEIGHT : 0;

  const { yScale, getX, getY, gridLines, yTicks, xTicks } = useChartScales(data, chartWidth, chartHeight, bottomInset);
  const { hoveredIndex, handleMouseMove, handleTouchMove, handleLeave } = useChartInteraction(
    svgRef,
    data,
    getX,
    chartPad.left,
  );

  // Group nearby votes into avatar clusters positioned along the time axis (see buildAvatarClusters).
  const voterClusters = useMemo(() => buildAvatarClusters(voteEvents, data, getX), [voteEvents, data, getX]);
  // Seat the avatars toward the bottom of their lane (not centered): the price line is squeezed to end
  // at chartHeight - AVATAR_LANE_HEIGHT, then we drop AVATAR_LANE_TOP_GAP + a radius below that so the
  // avatars clear the bottom gridline — keeping the breathing room above them generous.
  const laneCenterY = chartHeight - AVATAR_LANE_HEIGHT + AVATAR_LANE_TOP_GAP + AVATAR_RADIUS;

  const collapsed = isExpanded === false;

  if (width <= 0 || data.length === 0) return null;
  if (!collapsed && (height <= 0 || chartWidth <= 0 || chartHeight <= 0)) return null;

  const currentPoint = data[currentIndex] || data[0];
  const currentDotX = currentPoint ? getX(currentPoint) : 0;
  const currentDotY = yScale(currentPrice);

  const hoveredPoint = hoveredIndex !== null ? data[hoveredIndex] : null;
  const isHovering = hoveredPoint !== null;

  const isDuring = contestPhase === "during";
  const formatPriceForHeader = formatHeaderPrice ?? formatPrice;
  const priceRangeText = `${formatPriceForHeader(startPriceValue)}-${formatPriceForHeader(endPriceValue)}`;
  const headerPrice = isDuring ? formatPriceForHeader(currentPrice) : priceRangeText;
  const tenseVerb = contestPhase === "after" ? "increased" : "increases";
  const isLogarithmic = priceCurveType === PriceCurveType.Logarithmic;
  const intervalText = isDuring
    ? `${tenseVerb} ${isBelowThreshold ? "" : `${percentageIncrease}% `}in ${secondsUntilNextUpdate} seconds`
    : isLogarithmic
      ? ""
      : `${tenseVerb} ${isBelowThreshold ? "" : `${percentageIncrease}% `}every ${updateIntervalSeconds} seconds`;

  return (
    <div
      className={`relative w-full select-none touch-pan-y overflow-visible ${noPadding ? "" : "rounded-[32px] bg-true-black"}`}
      style={noPadding ? undefined : CARD_PADDING_STYLE}
    >
      <PriceCurveHeader
        headerPrice={headerPrice}
        intervalText={intervalText}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
      />

      {collapsed ? null : (
        <svg ref={svgRef} width={svgWidth} height={Math.max(svgHeight, 0)} style={SVG_OVERFLOW_STYLE}>
          <Group left={chartPad.left} top={chartPad.top}>
            <GridLines gridLines={gridLines} chartWidth={chartWidth} />
            <ConfettiParticles chartWidth={chartWidth} chartHeight={chartHeight} seed={data.length} />

            <LinePath
              data={data}
              x={getX}
              y={getY}
              stroke={CHART_CONFIG.colors.mainLine}
              strokeWidth={1.5}
              curve={curveMonotoneX}
              fill="none"
            />

            {!isHovering && currentPoint && <AnimatedDot x={currentDotX} y={currentDotY} isHovered={false} />}

            {isHovering && hoveredPoint && (
              <HoverOverlay
                hoveredPoint={hoveredPoint}
                hoveredDotX={getX(hoveredPoint)}
                hoveredDotY={yScale(hoveredPoint.pv)}
                chartWidth={chartWidth}
                chartHeight={chartHeight}
                chartPadTop={chartPad.top}
                chartPadRight={chartPad.right}
                svgHeight={svgHeight}
                formatPrice={formatPrice}
              />
            )}

            <rect
              x={0}
              y={0}
              width={chartWidth}
              height={chartHeight}
              fill="transparent"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleLeave}
              onTouchStart={handleTouchMove}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleLeave}
              style={TOUCH_PAN_STYLE}
            />

            {/* Rendered after the capture rect so the avatars receive hover, not the rect. */}
            {showVoterLane && <VoterAvatarStrip clusters={voterClusters} centerY={laneCenterY} />}

            {showAxisLabels && (
              <AxisLabels
                yTicks={yTicks}
                xTicks={xTicks}
                chartWidth={chartWidth}
                chartHeight={chartHeight}
                chartPadRight={chartPad.right}
                yScale={yScale}
                getX={getX}
                formatPrice={formatPrice}
              />
            )}
          </Group>
        </svg>
      )}

      {!collapsed && showVoterLane && (
        <VoterAvatarTooltip clusters={voterClusters} formatPrice={formatPrice} entryTitlesById={entryTitlesById} />
      )}
    </div>
  );
};

export default PriceCurve;
