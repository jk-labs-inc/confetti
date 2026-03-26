import { FC } from "react";
import moment from "moment";
import { ChartDataPoint } from "../../types";

interface AxisLabelsProps {
  yTicks: number[];
  xTicks: ChartDataPoint[];
  chartWidth: number;
  chartHeight: number;
  chartPadRight: number;
  yScale: (value: number) => number;
  getX: (d: ChartDataPoint) => number;
  formatPrice: (nativePrice: number) => string;
}

const AxisLabels: FC<AxisLabelsProps> = ({
  yTicks,
  xTicks,
  chartWidth,
  chartHeight,
  chartPadRight,
  yScale,
  getX,
  formatPrice,
}) => {
  return (
    <>
      {yTicks.map((tick, i) => (
        <text
          key={`y-tick-${i}`}
          x={chartWidth + chartPadRight}
          y={yScale(tick)}
          fill="#6A6A6A"
          fontSize={10}
          dominantBaseline="middle"
          textAnchor="end"
        >
          {formatPrice(tick)}
        </text>
      ))}

      {xTicks.map((tick, i) => {
        const anchor = i === 0 ? "start" : i === xTicks.length - 1 ? "end" : "middle";
        return (
          <text
            key={`x-tick-${i}`}
            x={getX(tick)}
            y={chartHeight + 16}
            fill="#6A6A6A"
            fontSize={10}
            textAnchor={anchor}
          >
            {moment(tick.date).format("h:mma")}
          </text>
        );
      })}
    </>
  );
};

export default AxisLabels;
