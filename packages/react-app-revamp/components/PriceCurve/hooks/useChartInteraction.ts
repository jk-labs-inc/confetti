import React, { RefObject, useCallback, useState } from "react";
import { ChartDataPoint } from "../types";

export const useChartInteraction = (
  svgRef: RefObject<SVGSVGElement | null>,
  data: ChartDataPoint[],
  getX: (d: ChartDataPoint) => number,
  chartPadLeft: number,
) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const getLocalX = useCallback(
    (clientX: number) => {
      if (!svgRef.current) return null;
      const rect = svgRef.current.getBoundingClientRect();
      return clientX - rect.left - chartPadLeft;
    },
    [svgRef, chartPadLeft],
  );

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

  return { hoveredIndex, handleMouseMove, handleTouchMove, handleLeave };
};
