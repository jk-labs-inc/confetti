import { scaleLinear, scalePoint } from "@visx/scale";
import { useMemo } from "react";
import { ChartDataPoint } from "../types";
import { GRID_LINE_COUNT } from "../constants";

export const useChartScales = (data: ChartDataPoint[], chartWidth: number, chartHeight: number) => {
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

  const gridLines = useMemo(() => {
    return Array.from({ length: GRID_LINE_COUNT }, (_, i) => {
      return (i / (GRID_LINE_COUNT - 1)) * chartHeight;
    });
  }, [chartHeight]);

  const yTicks = useMemo(() => {
    if (chartHeight <= 0 || data.length === 0) return [];
    const prices = data.map(d => d.pv);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const count = 4;
    return Array.from({ length: count }, (_, i) => min + (max - min) * (i / (count - 1)));
  }, [data, chartHeight]);

  const xTicks = useMemo(() => {
    if (data.length < 2) return [];
    const count = 4;
    return Array.from({ length: count }, (_, i) => {
      const idx = Math.round((i / (count - 1)) * (data.length - 1));
      return data[idx];
    });
  }, [data]);

  return { yScale, getX, getY, gridLines, yTicks, xTicks };
};
