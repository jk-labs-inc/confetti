import AnimatedDot from "@components/PriceCurve/components/AnimatedDot";
import { ChartDataPoint } from "@components/PriceCurve/types";
import moment from "moment";
import { FC } from "react";
import {
  COMPACT_CURVE_DOT_RADIUS,
  COMPACT_CURVE_HOVER_DATE_FORMAT,
  COMPACT_CURVE_HOVER_LABEL_FLIP_RATIO,
  COMPACT_CURVE_HOVER_LABEL_HALF_HEIGHT_PX,
  COMPACT_CURVE_HOVER_LABEL_HALO_COLOR,
  COMPACT_CURVE_HOVER_LABEL_HALO_WIDTH,
  COMPACT_CURVE_HOVER_LABEL_OFFSET_PX,
  COMPACT_CURVE_HOVER_LINE_STROKE,
  COMPACT_CURVE_HOVER_PRICE_COLOR,
  COMPACT_CURVE_LABEL_COLOR,
} from "../../constants";

interface CompactHoverOverlayProps {
  point: ChartDataPoint;
  x: number;
  y: number;
  chartWidth: number;
  chartHeight: number;
  formatPrice: (nativePrice: number) => string;
}

const CompactHoverOverlay: FC<CompactHoverOverlayProps> = ({ point, x, y, chartWidth, chartHeight, formatPrice }) => {
  const flipsLeft = x > chartWidth * COMPACT_CURVE_HOVER_LABEL_FLIP_RATIO;
  const labelX = flipsLeft ? x - COMPACT_CURVE_HOVER_LABEL_OFFSET_PX : x + COMPACT_CURVE_HOVER_LABEL_OFFSET_PX;
  const labelY = Math.min(
    Math.max(y, COMPACT_CURVE_HOVER_LABEL_HALF_HEIGHT_PX),
    chartHeight - COMPACT_CURVE_HOVER_LABEL_HALF_HEIGHT_PX,
  );

  const haloProps = {
    stroke: COMPACT_CURVE_HOVER_LABEL_HALO_COLOR,
    strokeWidth: COMPACT_CURVE_HOVER_LABEL_HALO_WIDTH,
    strokeLinejoin: "round" as const,
    paintOrder: "stroke",
  };

  return (
    <>
      <line x1={x} x2={x} y1={0} y2={chartHeight} stroke={COMPACT_CURVE_HOVER_LINE_STROKE} strokeWidth={1} />
      <AnimatedDot x={x} y={y} isHovered={false} radius={COMPACT_CURVE_DOT_RADIUS} />
      <text
        x={labelX}
        y={labelY - 2}
        textAnchor={flipsLeft ? "end" : "start"}
        fill={COMPACT_CURVE_HOVER_PRICE_COLOR}
        fontSize={11}
        fontWeight={700}
        className="normal-case"
        {...haloProps}
      >
        {formatPrice(point.pv)}
      </text>
      <text
        x={labelX}
        y={labelY + 10}
        textAnchor={flipsLeft ? "end" : "start"}
        fill={COMPACT_CURVE_LABEL_COLOR}
        fontSize={10}
        fontWeight={700}
        className="normal-case"
        {...haloProps}
      >
        {moment(point.date).format(COMPACT_CURVE_HOVER_DATE_FORMAT).toLowerCase()}
      </text>
    </>
  );
};

export default CompactHoverOverlay;
