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
    (nativeFormatted: string, symbol: string): string => {
      const { displayValue, displaySymbol } = convertToDisplayPrice(
        nativeFormatted,
        symbol,
        displayCurrency,
        nativeRates ?? {},
      );

      return displaySymbol === "$" ? `$${displayValue}` : `${displayValue} ${displaySymbol}`;
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
          return formatPriceLabel(formatEther(priceInWei), currency);
        }}
        tickLabelProps={() => {
          return {
            fill: "#ffffff",
            fontSize: 12,
            textAnchor: "start",
            dy: "0.33em",
            dx: 8,
            className: "uppercase",
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
        const label = formatPriceLabel(formatEther(priceInWei), currency);

        return (
          <g key={`current-tick-${tick}`}>
            <rect x={chartWidth + 8} y={yPos - 14} width={estimateLabelWidth(label)} height={24} rx={8} fill="#BB65FF" />
            <text
              className="uppercase"
              x={chartWidth + 8 + estimateLabelWidth(label) / 2}
              y={yPos}
              fill="#000000"
              fontSize={12}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {label}
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
          const label = formatPriceLabel(formatEther(priceInWei), currency);

          return (
            <g key={`hovered-tick-${tick}`}>
              <rect
                x={chartWidth + 8}
                y={yPos - 14}
                width={estimateLabelWidth(label)}
                height={24}
                rx={8}
                fill="#212121"
              />
              <text
                className="uppercase"
                x={chartWidth + 8 + estimateLabelWidth(label) / 2}
                y={yPos}
                fill="#ffffff"
                fontSize={12}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {label}
              </text>
            </g>
          );
        })}
    </g>
  );
};

export default AxisRight;
