import AnimatedDot from "@components/PriceCurve/components/AnimatedDot";
import { CHART_CONFIG, SVG_OVERFLOW_STYLE, TOUCH_PAN_STYLE } from "@components/PriceCurve/constants";
import { useChartInteraction } from "@components/PriceCurve/hooks/useChartInteraction";
import { useChartScales } from "@components/PriceCurve/hooks/useChartScales";
import { ChartDataPoint } from "@components/PriceCurve/types";
import { useNativePriceFormatter } from "@hooks/useNativePriceFormatter";
import { curveMonotoneX } from "@visx/curve";
import { Group } from "@visx/group";
import { useParentSize } from "@visx/responsive";
import { LinePath } from "@visx/shape";
import { FC, useMemo, useRef } from "react";
import {
  COMPACT_CURVE_DOT_RADIUS,
  COMPACT_CURVE_GRID_LINE_COUNT,
  COMPACT_CURVE_HALO_FILL,
  COMPACT_CURVE_HALO_RADIUS,
  COMPACT_CURVE_LABEL_GUTTER_PX,
  COMPACT_CURVE_LABEL_OFFSET_PX,
  COMPACT_CURVE_LINE_WIDTH,
  COMPACT_CURVE_VERTICAL_INSET_PX,
} from "../../constants";
import CompactCurveLabels from "./CompactCurveLabels";
import CompactHoverOverlay from "./CompactHoverOverlay";
import CompactGridLines from "./CompactGridLines";
import { CompactGridLine } from "./types";

interface CompactCurveProps {
  chartData: ChartDataPoint[];
  currentPrice: number;
  currentIndex: number;
  isLoading: boolean;
  heightClassName: string;
}

const CompactCurve: FC<CompactCurveProps> = ({ chartData, currentPrice, currentIndex, isLoading, heightClassName }) => {
  const { parentRef, width, height } = useParentSize({ debounceTime: 150 });
  const formatPrice = useNativePriceFormatter();

  const chartWidth = Math.max(0, width - COMPACT_CURVE_LABEL_GUTTER_PX);
  const chartHeight = Math.max(0, height - COMPACT_CURVE_VERTICAL_INSET_PX);
  const { yScale, getX, getY } = useChartScales(chartData, chartWidth, chartHeight);
  const svgRef = useRef<SVGSVGElement>(null);
  const { hoveredIndex, handleMouseMove, handleTouchMove, handleLeave } = useChartInteraction(
    svgRef,
    chartData,
    getX,
    0,
  );

  const hasChartArea = chartWidth > 0 && chartHeight > 0 && chartData.length > 0;
  const gridLines = useMemo<CompactGridLine[]>(() => {
    if (!hasChartArea) return [];
    return Array.from({ length: COMPACT_CURVE_GRID_LINE_COUNT }, (_, index) => {
      const y = (index / (COMPACT_CURVE_GRID_LINE_COUNT - 1)) * chartHeight;
      return { y, label: formatPrice(yScale.invert(y)) };
    });
  }, [hasChartArea, chartHeight, yScale, formatPrice]);

  if (isLoading || !hasChartArea) {
    return (
      <div ref={parentRef} className={`w-full shrink-0 animate-pulse rounded-lg bg-neutral-2 ${heightClassName}`} />
    );
  }

  const currentPoint = chartData[currentIndex] || chartData[0];
  const x = getX(currentPoint);
  const y = yScale(currentPrice);
  const hoveredPoint = hoveredIndex === null ? null : chartData[hoveredIndex];

  return (
    <div ref={parentRef} className={`w-full shrink-0 ${heightClassName}`}>
      <svg ref={svgRef} width={width} height={height} style={SVG_OVERFLOW_STYLE}>
        <Group top={COMPACT_CURVE_VERTICAL_INSET_PX / 2}>
          <CompactGridLines lines={gridLines} chartWidth={chartWidth} />
          <LinePath
            data={chartData}
            x={getX}
            y={getY}
            stroke={CHART_CONFIG.colors.mainLine}
            strokeWidth={COMPACT_CURVE_LINE_WIDTH}
            curve={curveMonotoneX}
          />
          {!hoveredPoint && <CompactCurveLabels lines={gridLines} x={chartWidth + COMPACT_CURVE_LABEL_OFFSET_PX} />}
          {hoveredPoint ? (
            <CompactHoverOverlay
              point={hoveredPoint}
              x={getX(hoveredPoint)}
              y={yScale(hoveredPoint.pv)}
              chartWidth={chartWidth}
              chartHeight={chartHeight}
              formatPrice={formatPrice}
            />
          ) : (
            <>
              <circle cx={x} cy={y} r={COMPACT_CURVE_HALO_RADIUS} fill={COMPACT_CURVE_HALO_FILL} />
              <AnimatedDot x={x} y={y} isHovered={false} radius={COMPACT_CURVE_DOT_RADIUS} />
            </>
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
        </Group>
      </svg>
    </div>
  );
};

export default CompactCurve;
