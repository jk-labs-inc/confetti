import { Group } from "@visx/group";
import { Pie } from "@visx/shape";
import { ParentSize } from "@visx/responsive";
import { useMediaQuery } from "react-responsive";

type FundData = {
  label: string;
  value: number;
  color: string;
  textColor: string;
};

const data: FundData[] = [
  { label: "voters", value: 90, color: "#bb65ff", textColor: "#bb65ff" },
  { label: "confetti", value: 5, color: "#66DEFF", textColor: "#66DEFF" },
  { label: "contest creators", value: 5, color: "#78ffc6", textColor: "#78ffc6" },
];

const getValue = (d: FundData) => d.value;

const START_ANGLE = Math.PI * 0.7;
const END_ANGLE = Math.PI * 2.7;

type PieChartProps = {
  width: number;
  height: number;
};

const PieChart = ({ width, height }: PieChartProps) => {
  const isMobile = useMediaQuery({ maxWidth: 1024 });
  const radius = Math.min(width, height) / 2;
  const centerX = radius;
  const centerY = height / 2;

  const gap = isMobile ? 4 : 8;
  const lineLength = isMobile ? 12 : 24;
  const lineWidth = isMobile ? 2 : 4;
  const textGap = isMobile ? 4 : 8;
  const votersTextOffset = isMobile ? 20 : 35;

  return (
    <svg
      width={width}
      height={height}
      aria-label="Funds distribution pie chart"
      role="img"
      style={{ overflow: "visible" }}
    >
      <Group top={centerY} left={centerX}>
        <Pie
          data={data}
          pieValue={getValue}
          outerRadius={radius}
          innerRadius={0}
          padAngle={0}
          startAngle={START_ANGLE}
          endAngle={END_ANGLE}
        >
          {pie =>
            pie.arcs.map((arc, index) => {
              const arcPath = pie.path(arc);
              const isVoters = arc.data.label === "voters";
              const isConfetti = arc.data.label === "confetti";
              const isContestCreators = arc.data.label === "contest creators";

              // For confetti: use midAngle (center of slice)
              // For contest creators: use endAngle (bottom edge of slice)
              const midAngle = (arc.startAngle + arc.endAngle) / 2;
              const angleToUse = isContestCreators ? arc.endAngle : midAngle;

              const sliceY = Math.sin(angleToUse - Math.PI / 2) * radius;

              // Add vertical offset to spread 5% labels apart
              const labelSpacing = isMobile ? 4 : 6;
              const labelVerticalOffset = isConfetti ? -labelSpacing : isContestCreators ? labelSpacing : 0;

              const edgeX = isVoters ? 0 : radius + gap;
              const edgeY = isVoters ? -radius - gap : sliceY + labelVerticalOffset;

              const labelX = isVoters ? 0 : radius + gap + lineLength;
              const labelY = isVoters ? -radius - gap - lineLength : sliceY + labelVerticalOffset;

              return (
                <g key={`arc-${index}`}>
                  <path d={arcPath || ""} fill={arc.data.color} />

                  {/* Connector line - vertical for voters, horizontal for small slices */}
                  <line
                    x1={edgeX}
                    y1={edgeY}
                    x2={labelX}
                    y2={labelY}
                    stroke={arc.data.textColor}
                    strokeWidth={lineWidth}
                  />

                  {/* Label */}
                  <text
                    x={isVoters ? 0 : labelX + textGap}
                    y={isVoters ? labelY - votersTextOffset : labelY}
                    textAnchor={isVoters ? "middle" : "start"}
                    dominantBaseline="middle"
                    className="text-base lg:text-xl 2xl:text-2xl font-bold"
                    fill="#e5e5e5"
                  >
                    <tspan x={isVoters ? 0 : labelX + textGap} dy="-0.6em" className="normal-case">
                      {arc.data.value}% of funds
                    </tspan>
                    <tspan x={isVoters ? 0 : labelX + textGap} dy="1.2em" className="normal-case">
                      to{" "}
                      <tspan fill={arc.data.textColor} className="normal-case">
                        {arc.data.label}
                      </tspan>
                    </tspan>
                  </text>
                </g>
              );
            })
          }
        </Pie>
      </Group>
    </svg>
  );
};

const FundsDistribution = () => {
  return (
    <div className="flex w-full pt-12 lg:pt-24 lg:pb-6 2xl:pb-0 2xl:pt-[105px]">
      <div className="w-full max-w-52 lg:max-w-60 2xl:max-w-[270px] aspect-square">
        <ParentSize>{({ width, height }) => <PieChart width={width} height={height} />}</ParentSize>
      </div>
    </div>
  );
};

export default FundsDistribution;
