import AnimatedDot from "./components/AnimatedDot";
import AxisLabels from "./components/AxisLabels";
import ConfettiParticles from "./components/ConfettiParticles";
import GridLines from "./components/GridLines";
import PriceCurveHeader from "./components/Header";
import HoverOverlay from "./components/HoverOverlay";
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
import { FC, useRef } from "react";

interface PriceCurveProps {
  data: ChartDataPoint[];
  currentPrice: number;
  currentIndex: number;
  width: number;
  height: number;
  formatPrice: (nativePrice: number) => string;
  percentageIncrease: number | null;
  isBelowThreshold: boolean;
  secondsUntilNextUpdate: number;
  votingTimeLeft: number;
  showPriceWarning?: boolean;
  contestPhase: "before" | "during" | "after";
  startPriceValue: number;
  endPriceValue: number;
  updateIntervalSeconds: number;
  noPadding?: boolean;
  showAxisLabels?: boolean;
}

const PriceCurve: FC<PriceCurveProps> = ({
  data,
  currentPrice,
  currentIndex,
  width,
  height,
  formatPrice,
  percentageIncrease,
  isBelowThreshold,
  secondsUntilNextUpdate,
  contestPhase,
  startPriceValue,
  endPriceValue,
  updateIntervalSeconds,
  noPadding = false,
  showAxisLabels = false,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const pad = noPadding ? NO_PADDING : CARD_PADDING;
  const chartPad = showAxisLabels ? CHART_PADDING_WITH_LABELS : CHART_PADDING;
  const svgWidth = width - pad.left - pad.right;
  const svgHeight = height - pad.top - HEADER_HEIGHT - pad.bottom;
  const chartWidth = svgWidth - chartPad.left - chartPad.right;
  const chartHeight = svgHeight - chartPad.top - chartPad.bottom;

  const { yScale, getX, getY, gridLines, yTicks, xTicks } = useChartScales(data, chartWidth, chartHeight);
  const { hoveredIndex, handleMouseMove, handleTouchMove, handleLeave } = useChartInteraction(
    svgRef,
    data,
    getX,
    chartPad.left,
  );

  if (width <= 0 || height <= 0 || data.length === 0 || chartWidth <= 0 || chartHeight <= 0) return null;

  const currentPoint = data[currentIndex] || data[0];
  const currentDotX = currentPoint ? getX(currentPoint) : 0;
  const currentDotY = yScale(currentPrice);

  const hoveredPoint = hoveredIndex !== null ? data[hoveredIndex] : null;
  const isHovering = hoveredPoint !== null;

  const isDuring = contestPhase === "during";
  const priceRangeText = `${formatPrice(startPriceValue)}-${formatPrice(endPriceValue)}`;
  const headerPrice = isDuring ? formatPrice(currentPrice) : priceRangeText;
  const tenseVerb = contestPhase === "after" ? "increased" : "increases";
  const intervalText = isDuring
    ? `${tenseVerb} ${isBelowThreshold ? "" : `${percentageIncrease}% `}in ${secondsUntilNextUpdate} seconds`
    : `${tenseVerb} ${isBelowThreshold ? "" : `${percentageIncrease}% `}every ${updateIntervalSeconds} seconds`;

  return (
    <div
      className={`relative w-full select-none touch-pan-y overflow-visible ${noPadding ? "" : "rounded-[32px] bg-true-black"}`}
      style={noPadding ? undefined : CARD_PADDING_STYLE}
    >
      <PriceCurveHeader headerPrice={headerPrice} intervalText={intervalText} />

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
    </div>
  );
};

export default PriceCurve;
