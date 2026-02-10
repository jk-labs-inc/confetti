import { useCurrencyStore } from "@hooks/useCurrency/store";
import { convertToDisplayPrice } from "@hooks/useCurrency/useDisplayPrice";
import useNativeRates from "@hooks/useCurrency/useNativeRates";
import { AxisRight as VisxAxisRight } from "@visx/axis";
import { ScaleLinear } from "d3-scale";
import React, { useCallback } from "react";
import { formatEther, parseEther } from "viem";

const CHAR_WIDTH = 5.5;
const LABEL_H_PADDING = 8 * 2;
const estimateLabelWidth = (text: string): number => text.length * CHAR_WIDTH + LABEL_H_PADDING;

interface AxisRightProps {
  yScale: ScaleLinear<number, number>;
  chartWidth: number;
  visibleTicks: number[];
  currentPrice: number;
  hoveredPrice: number | null;
  currency: string;
}

const AxisRight: React.FC<AxisRightProps> = ({
  yScale,
  chartWidth,
  visibleTicks,
  currentPrice,
  hoveredPrice,
  currency,
}) => {
  const displayCurrency = useCurrencyStore(state => state.displayCurrency);
  const { data: nativeRates } = useNativeRates();

  const formatPriceLabel = useCallback(
    (nativeFormatted: string, symbol: string): { full: string; primary: string; secondary: string | null } => {
      const { displayValue, displaySymbol, secondaryValue, secondarySymbol } = convertToDisplayPrice(
        nativeFormatted,
        symbol,
        displayCurrency,
        nativeRates ?? {},
      );

      const primary = displaySymbol === "$" ? `$${displayValue}` : `${displayValue} ${displaySymbol}`;

      if (!secondaryValue || !secondarySymbol) {
        return { full: primary, primary, secondary: null };
      }

      const secondary = secondarySymbol === "$" ? `$${secondaryValue}` : `${secondaryValue} ${secondarySymbol}`;

      return { full: `${primary} | ${secondary}`, primary, secondary: `| ${secondary}` };
    },
    [displayCurrency, nativeRates],
  );

  return (
    <g>
      <VisxAxisRight
        scale={yScale}
        left={chartWidth}
        tickValues={visibleTicks}
        tickFormat={(value: { toString: () => string }) => {
          const priceInWei = parseEther(value.toString());
          return formatPriceLabel(formatEther(priceInWei), currency).full;
        }}
        tickLabelProps={() => {
          return {
            fill: "#ffffff",
            fontSize: 12,
            textAnchor: "start",
            dy: "0.33em",
            dx: 8,
          };
        }}
        tickStroke="transparent"
        stroke="transparent"
      />

      {/* Custom styled backgrounds for current and hovered prices */}
      {visibleTicks.map(tick => {
        const isCurrentPrice = tick === currentPrice;
        if (!isCurrentPrice) return null;

        const yPos = yScale(tick);
        const priceInWei = parseEther(tick.toString());
        const { full, primary, secondary } = formatPriceLabel(formatEther(priceInWei), currency);

        return (
          <g key={`current-tick-${tick}`}>
            {/* Current price background (always rendered) */}
            <rect x={chartWidth + 8} y={yPos - 14} width={estimateLabelWidth(full)} height={24} rx={8} fill="#BB65FF" />
            <text
              x={chartWidth + 16}
              y={yPos}
              fill="#000000"
              fontSize={12}
              textAnchor="start"
              dominantBaseline="middle"
            >
              {primary}
              {secondary && <tspan fill="#3d3d3d"> {secondary}</tspan>}
            </text>
          </g>
        );
      })}

      {hoveredPrice !== null &&
        hoveredPrice !== currentPrice &&
        visibleTicks.map(tick => {
          const isHoveredPrice = tick === hoveredPrice;
          if (!isHoveredPrice) return null;

          const yPos = yScale(tick);
          const priceInWei = parseEther(tick.toString());
          const { full, primary, secondary } = formatPriceLabel(formatEther(priceInWei), currency);

          return (
            <g key={`hovered-tick-${tick}`}>
              {/* Hovered price background (renders on top) */}
              <rect
                x={chartWidth + 8}
                y={yPos - 14}
                width={estimateLabelWidth(full)}
                height={24}
                rx={8}
                fill="#212121"
              />
              <text
                x={chartWidth + 16}
                y={yPos}
                fill="#ffffff"
                fontSize={12}
                textAnchor="start"
                dominantBaseline="middle"
              >
                {primary}
                {secondary && <tspan fill="#9d9d9d"> {secondary}</tspan>}
              </text>
            </g>
          );
        })}
    </g>
  );
};

export default AxisRight;
