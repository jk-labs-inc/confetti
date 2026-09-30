import { FC } from "react";
import { COMPACT_CURVE_LABEL_COLOR } from "../../constants";
import { CompactGridLine } from "./types";

interface CompactCurveLabelsProps {
  lines: CompactGridLine[];
  x: number;
}

const CompactCurveLabels: FC<CompactCurveLabelsProps> = ({ lines, x }) => (
  <>
    {lines.map(line => (
      <text
        key={line.y}
        x={x}
        y={line.y}
        fill={COMPACT_CURVE_LABEL_COLOR}
        dominantBaseline="middle"
        className="text-[8px] wide:text-[9px] tabular-nums"
      >
        {line.label}
      </text>
    ))}
  </>
);

export default CompactCurveLabels;
