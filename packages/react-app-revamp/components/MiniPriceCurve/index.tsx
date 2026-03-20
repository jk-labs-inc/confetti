import { CHART_CONFIG } from "@components/_pages/Contest/components/PriceCurveChart/constants";
import { ChartDataPoint } from "@components/_pages/Contest/components/PriceCurveChart/types";
import { curveMonotoneX } from "@visx/curve";
import { Group } from "@visx/group";
import { scaleLinear, scalePoint } from "@visx/scale";
import { AreaClosed, LinePath } from "@visx/shape";
import { AnimatePresence, motion } from "motion/react";
import moment from "moment";
import React, { FC, useCallback, useId, useMemo, useRef, useState } from "react";

const PADDING = { top: 28, right: 4, left: 4, bottom: 14 };

const PARTICLE_SVGS = [
  "/particles/confetti-pink.svg",
  "/particles/confetti-purple.svg",
  "/particles/confetti-cyan.svg",
  "/particles/confetti-green.svg",
  "/particles/confetti-violet.svg",
];

interface MiniPriceCurveProps {
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

const MiniPriceCurve: FC<MiniPriceCurveProps> = ({
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
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gradientId = useId();

  const chartWidth = width - PADDING.left - PADDING.right;
  const chartHeight = height - PADDING.top - PADDING.bottom;

  const { yScale, getX, getY } = useMemo(() => {
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

  const startPrice = data[0]?.pv ?? 0;
  const endPrice = data[data.length - 1]?.pv ?? 0;

  const currentPoint = data[currentIndex] || data[0];
  const hoveredPoint = hoveredIndex !== null ? data[hoveredIndex] : null;
  const isHovering = hoveredPoint !== null;

  const displayPrice = hoveredPoint?.pv ?? currentPrice;
  const priceLabel = hoveredPoint ? moment(hoveredPoint.date).format("MMM D, h:mm a").toLowerCase() : "price per vote:";

  const currentDotX = currentPoint ? getX(currentPoint) : 0;
  const currentDotY = yScale(currentPrice);

  const hoveredDotX = hoveredPoint ? getX(hoveredPoint) : 0;
  const hoveredDotY = hoveredPoint ? yScale(hoveredPoint.pv) : 0;

  const getLocalX = useCallback((clientX: number) => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    return clientX - rect.left - PADDING.left;
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

  if (width <= 0 || height <= 0 || data.length === 0) return null;

  const mainColor = CHART_CONFIG.colors.mainLine;

  return (
    <div className="relative w-full select-none touch-pan-y">
      <div className="absolute top-1 left-1 z-10 pointer-events-none flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={isHovering ? "hovered" : "current"}
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="flex items-baseline gap-1.5"
          >
            <span className="text-base text-neutral-9 tracking-wide lowercase">{priceLabel}</span>
            <span className="text-base font-bold text-neutral-11">{formatPrice(displayPrice)}</span>
          </motion.div>
        </AnimatePresence>
        {!isHovering &&
          votingTimeLeft > 60 &&
          (showPriceWarning && secondsUntilNextUpdate < 15 ? (
            <p className="text-xs text-secondary-11 animate-pulse mt-0.5">wait for price update or tx may fail</p>
          ) : (
            <p className="text-xs text-neutral-9 opacity-60 mt-0.5">
              increases {isBelowThreshold ? "" : `${percentageIncrease}% `}in {secondsUntilNextUpdate} seconds
            </p>
          ))}
      </div>

      <svg ref={svgRef} width={width} height={height} overflow="hidden">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={mainColor} stopOpacity={0.18} />
            <stop offset="100%" stopColor={mainColor} stopOpacity={0} />
          </linearGradient>
        </defs>

        <Group left={PADDING.left} top={PADDING.top}>
          <AreaClosed
            data={data}
            x={getX}
            y={getY}
            yScale={yScale}
            curve={curveMonotoneX}
            fill={`url(#${gradientId})`}
          />

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

          {isHovering && (
            <line
              x1={hoveredDotX}
              x2={hoveredDotX}
              y1={0}
              y2={chartHeight}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth={1}
            />
          )}

          {isHovering && <circle cx={hoveredDotX} cy={hoveredDotY} r={4.5} fill="#ffffff" />}

          {currentPoint && !isHovering && (
            <g>
              {PARTICLE_SVGS.slice(0, 3).map((svg, i) => (
                <motion.image
                  key={`trail-${i}`}
                  href={svg}
                  width={5}
                  height={5}
                  x={currentDotX - 2.5}
                  y={currentDotY - 2.5}
                  animate={{
                    x: [currentDotX - 2.5, currentDotX - 10 + i * 10],
                    y: [currentDotY - 2.5, currentDotY + 6 + i * 4],
                    opacity: [0.5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut",
                    delay: i * 0.7,
                  }}
                />
              ))}

              <motion.circle
                cx={currentDotX}
                cy={currentDotY}
                r={4.5}
                fill={mainColor}
                animate={{ r: [4.5, 5.5, 4.5] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                style={{ filter: `drop-shadow(0 0 3px ${mainColor}80)` }}
              />
            </g>
          )}

          <rect
            width={chartWidth}
            height={chartHeight}
            fill="transparent"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleLeave}
            onTouchStart={handleTouchMove}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleLeave}
            style={{ touchAction: "pan-y" }}
          />
        </Group>
      </svg>

      <div className="flex justify-between px-1 pointer-events-none -mt-1">
        <span className="text-xs text-neutral-9 opacity-60">{formatPrice(startPrice)}</span>
        <span className="text-xs text-neutral-9 opacity-60">{formatPrice(endPrice)}</span>
      </div>
    </div>
  );
};

export default MiniPriceCurve;
