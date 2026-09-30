import { FC } from "react";
import { COMPACT_CURVE_GRID_COLOR, COMPACT_CURVE_GRID_DASH } from "../../constants";
import { CompactGridLine } from "./types";

interface CompactGridLinesProps {
  lines: CompactGridLine[];
  chartWidth: number;
}

const CompactGridLines: FC<CompactGridLinesProps> = ({ lines, chartWidth }) => (
  <>
    {lines.map(line => (
      <line
        key={line.y}
        x1={0}
        x2={chartWidth}
        y1={line.y}
        y2={line.y}
        stroke={COMPACT_CURVE_GRID_COLOR}
        strokeWidth={1}
        strokeDasharray={COMPACT_CURVE_GRID_DASH}
      />
    ))}
  </>
);

export default CompactGridLines;
