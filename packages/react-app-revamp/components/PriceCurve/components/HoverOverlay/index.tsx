import { FC } from "react";
import moment from "moment";
import AnimatedDot from "../AnimatedDot";
import { ChartDataPoint } from "../../types";

interface HoverOverlayProps {
  hoveredPoint: ChartDataPoint;
  hoveredDotX: number;
  hoveredDotY: number;
  chartWidth: number;
  chartHeight: number;
  chartPadTop: number;
  chartPadRight: number;
  svgHeight: number;
  formatPrice: (nativePrice: number) => string;
}

const HoverOverlay: FC<HoverOverlayProps> = ({
  hoveredPoint,
  hoveredDotX,
  hoveredDotY,
  chartWidth,
  chartHeight,
  chartPadTop,
  chartPadRight,
  svgHeight,
  formatPrice,
}) => {
  const dateLabel = moment(hoveredPoint.date).format("MMM D, h:mmA");
  const nearLeftEdge = hoveredDotX < chartWidth * 0.15;
  const nearRightEdge = hoveredDotX > chartWidth * 0.85;
  const dateLabelX = nearLeftEdge ? 0 : nearRightEdge ? chartWidth : hoveredDotX;
  const dateLabelAnchor: "start" | "middle" | "end" = nearLeftEdge ? "start" : nearRightEdge ? "end" : "middle";

  return (
    <>
      <rect
        x={hoveredDotX}
        y={-chartPadTop}
        width={chartWidth + chartPadRight - hoveredDotX}
        height={svgHeight}
        fill="rgba(0,0,0,0.7)"
      />

      <line
        x1={hoveredDotX}
        x2={hoveredDotX}
        y1={0}
        y2={chartHeight}
        stroke="rgba(255,255,255,0.25)"
        strokeWidth={1}
      />

      <text
        x={dateLabelX}
        y={-6}
        textAnchor={dateLabelAnchor}
        fill="#9d9d9d"
        fontSize={12}
        fontWeight={700}
        className="uppercase"
      >
        {dateLabel}
      </text>

      <AnimatedDot x={hoveredDotX} y={hoveredDotY} isHovered={false} />

      <text
        x={hoveredDotX + 14}
        y={hoveredDotY - 4}
        textAnchor="start"
        fill="#58F4FF"
        fontSize={12}
        fontWeight={700}
        className="normal-case"
      >
        {formatPrice(hoveredPoint.pv)}
      </text>
      <text
        x={hoveredDotX + 14}
        y={hoveredDotY + 10}
        textAnchor="start"
        fill="#58F4FF"
        fontSize={12}
        fontWeight={700}
      >
        per vote
      </text>
    </>
  );
};

export default HoverOverlay;
