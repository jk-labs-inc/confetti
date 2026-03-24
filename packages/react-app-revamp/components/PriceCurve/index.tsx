import AnimatedDot from "./components/AnimatedDot";
import { CHART_CONFIG } from "./constants";
import { ChartDataPoint } from "./types";
import { curveMonotoneX } from "@visx/curve";
import { Group } from "@visx/group";
import { scaleLinear, scalePoint } from "@visx/scale";
import { LinePath } from "@visx/shape";
import moment from "moment";
import React, { FC, useCallback, useMemo, useRef, useState } from "react";

const CARD_PADDING = { top: 24, right: 32, bottom: 24, left: 32 };
const CARD_PADDING_STYLE = { padding: `${CARD_PADDING.top}px ${CARD_PADDING.right}px ${CARD_PADDING.bottom}px ${CARD_PADDING.left}px` };
const NO_PADDING = { top: 0, right: 0, bottom: 0, left: 0 };
const HEADER_HEIGHT = 48;
const CHART_PADDING = { top: 22, right: 8, left: 8, bottom: 24 };
const GRID_LINE_COUNT = 5;
const SVG_OVERFLOW_STYLE = { overflow: "visible" } as const;
const TOUCH_PAN_STYLE = { touchAction: "pan-y" } as const;

const PARTICLE_SVGS = [
  "/particles/confetti-pink.svg",
  "/particles/confetti-purple.svg",
  "/particles/confetti-cyan.svg",
  "/particles/confetti-green.svg",
  "/particles/confetti-violet.svg",
];

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
}

const generateConfettiParticles = (chartWidth: number, chartHeight: number, seed: number) => {
  const particles = [];
  const count = 10;
  for (let i = 0; i < count; i++) {
    const hash = ((seed + i * 7919) * 104729) % 1000;
    particles.push({
      x: (((hash * 3) % 1000) / 1000) * chartWidth,
      y: chartHeight * 0.3 + (((hash * 7) % 1000) / 1000) * chartHeight * 0.65,
      size: 4 + (hash % 3) * 2,
      svg: PARTICLE_SVGS[i % PARTICLE_SVGS.length],
      opacity: 0.2 + (hash % 4) * 0.05,
    });
  }
  return particles;
};

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
  votingTimeLeft,
  showPriceWarning = false,
  contestPhase,
  startPriceValue,
  endPriceValue,
  updateIntervalSeconds,
  noPadding = false,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const pad = noPadding ? NO_PADDING : CARD_PADDING;
  const svgWidth = width - pad.left - pad.right;
  const svgHeight = height - pad.top - HEADER_HEIGHT - pad.bottom;
  const chartWidth = svgWidth - CHART_PADDING.left - CHART_PADDING.right;
  const chartHeight = svgHeight - CHART_PADDING.top - CHART_PADDING.bottom;

  const { yScale, getX, getY } = useMemo(() => {
    if (chartWidth <= 0 || chartHeight <= 0) {
      return {
        yScale: scaleLinear({ range: [0, 0], domain: [0, 1] }),
        getX: () => 0,
        getY: () => 0,
      };
    }

    const xs = scalePoint({
      range: [0, chartWidth],
      domain: data.map(d => d.id),
    });

    const prices = data.map(d => d.pv);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const span = max - min || 1;

    const ys = scaleLinear({
      range: [chartHeight, 0],
      domain: [min - span * 0.02, max + span * 0.02],
    });

    return {
      yScale: ys,
      getX: (d: ChartDataPoint) => xs(d.id) ?? 0,
      getY: (d: ChartDataPoint) => ys(d.pv) ?? 0,
    };
  }, [data, chartWidth, chartHeight]);

  const confettiParticles = useMemo(
    () => generateConfettiParticles(chartWidth, chartHeight, data.length),
    [chartWidth, chartHeight, data.length],
  );

  const currentPoint = data[currentIndex] || data[0];
  const currentDotX = currentPoint ? getX(currentPoint) : 0;
  const currentDotY = yScale(currentPrice);

  const hoveredPoint = hoveredIndex !== null ? data[hoveredIndex] : null;
  const isHovering = hoveredPoint !== null;

  const hoveredDotX = hoveredPoint ? getX(hoveredPoint) : 0;
  const hoveredDotY = hoveredPoint ? yScale(hoveredPoint.pv) : 0;
  const hoveredDateLabel = hoveredPoint ? moment(hoveredPoint.date).format("MMM D, h:mmA") : "";
  const nearLeftEdge = hoveredDotX < chartWidth * 0.15;
  const nearRightEdge = hoveredDotX > chartWidth * 0.85;
  const dateLabelX = nearLeftEdge ? 0 : nearRightEdge ? chartWidth : hoveredDotX;
  const dateLabelAnchor: "start" | "middle" | "end" = nearLeftEdge ? "start" : nearRightEdge ? "end" : "middle";

  const gridLines = useMemo(() => {
    return Array.from({ length: GRID_LINE_COUNT }, (_, i) => {
      return (i / (GRID_LINE_COUNT - 1)) * chartHeight;
    });
  }, [chartHeight]);

  const getLocalX = useCallback((clientX: number) => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    return clientX - rect.left - CHART_PADDING.left;
  }, []);

  const findAndSetClosest = useCallback(
    (localX: number) => {
      let closest = 0;
      let closestDist = Infinity;
      for (let i = 0; i < data.length; i++) {
        const dist = Math.abs(getX(data[i]) - localX);
        if (dist < closestDist) {
          closestDist = dist;
          closest = i;
        }
      }
      setHoveredIndex(closest);
    },
    [data, getX],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGRectElement>) => {
      const x = getLocalX(e.clientX);
      if (x !== null) findAndSetClosest(x);
    },
    [getLocalX, findAndSetClosest],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<SVGRectElement>) => {
      if (!e.touches[0]) return;
      const x = getLocalX(e.touches[0].clientX);
      if (x !== null) findAndSetClosest(x);
    },
    [getLocalX, findAndSetClosest],
  );

  const handleLeave = useCallback(() => setHoveredIndex(null), []);

  if (width <= 0 || height <= 0 || data.length === 0 || chartWidth <= 0 || chartHeight <= 0) return null;

  const mainColor = CHART_CONFIG.colors.mainLine;
  const showWarning = showPriceWarning && secondsUntilNextUpdate < 15 && votingTimeLeft > 60;

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
      <div style={{ minHeight: HEADER_HEIGHT }}>
        <div className="flex justify-between items-baseline">
          <span className="text-[16px] text-neutral-9 tracking-wide">price per vote</span>
          <span className="text-[16px] text-neutral-9 leading-tight normal-case">{headerPrice}</span>
        </div>
        <div className="flex justify-between items-baseline mt-0.5">
          <span className="text-[12px] text-neutral-9">{intervalText}</span>
          {isDuring && showWarning && (
            <span className="text-[12px] text-secondary-11 animate-pulse">wait for price update or tx may fail</span>
          )}
        </div>
      </div>

      <svg ref={svgRef} width={svgWidth} height={Math.max(svgHeight, 0)} style={SVG_OVERFLOW_STYLE}>
        <Group left={CHART_PADDING.left} top={CHART_PADDING.top}>
          {gridLines.map((y, i) => (
            <line
              key={`grid-${i}`}
              x1={0}
              x2={chartWidth}
              y1={y}
              y2={y}
              stroke="#6A6A6A"
              strokeWidth={1}
              strokeDasharray="8 6"
              opacity={0.5}
            />
          ))}

          {confettiParticles.map((p, i) => (
            <image
              key={`confetti-${i}`}
              href={p.svg}
              x={p.x - p.size / 2}
              y={p.y - p.size / 2}
              width={p.size}
              height={p.size}
              opacity={p.opacity}
            />
          ))}

          <LinePath
            data={data}
            x={getX}
            y={getY}
            stroke={mainColor}
            strokeWidth={1.5}
            curve={curveMonotoneX}
            fill="none"
          />

          {!isHovering && currentPoint && <AnimatedDot x={currentDotX} y={currentDotY} isHovered={false} />}

          {isHovering && (
            <>
              <rect
                x={hoveredDotX}
                y={-CHART_PADDING.top}
                width={chartWidth + CHART_PADDING.right - hoveredDotX}
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
                {hoveredDateLabel}
              </text>

              <AnimatedDot x={hoveredDotX} y={hoveredDotY} isHovered={false} />

              <text
                x={hoveredDotX + 14}
                y={hoveredDotY + 4}
                textAnchor="start"
                fill="#58F4FF"
                fontSize={12}
                fontWeight={700}
                className="normal-case"
              >
                {formatPrice(hoveredPoint!.pv)}
              </text>
              <text
                x={hoveredDotX + 14}
                y={hoveredDotY + 18}
                textAnchor="start"
                fill="#58F4FF"
                fontSize={12}
                fontWeight={700}
              >
                per vote
              </text>
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

export default PriceCurve;
