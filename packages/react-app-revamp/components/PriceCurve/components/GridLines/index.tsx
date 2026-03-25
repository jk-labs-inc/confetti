import { FC } from "react";

interface GridLinesProps {
  gridLines: number[];
  chartWidth: number;
}

const GridLines: FC<GridLinesProps> = ({ gridLines, chartWidth }) => {
  return (
    <>
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
    </>
  );
};

export default GridLines;
