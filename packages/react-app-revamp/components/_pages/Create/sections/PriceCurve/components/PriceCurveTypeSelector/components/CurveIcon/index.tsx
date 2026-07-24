import { PriceCurveType } from "@hooks/useDeployContest/types";
import { motion } from "motion/react";
import { FC } from "react";
import { CURVE_PATHS } from "../../constants";

interface CurveIconProps {
  type: PriceCurveType;
}

const CurveIcon: FC<CurveIconProps> = ({ type }) => {
  const { path, dot } = CURVE_PATHS[type];
  const gradientId = `curve-dot-gradient-${type}`;

  return (
    <div className="w-full aspect-[2/1] rounded-lg border border-primary-5 bg-true-black p-2">
      <svg viewBox="0 0 100 60" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id={gradientId} cx="50%" cy="50%" r="50%">
            <motion.stop
              offset="0%"
              stopColor="#BB65FF"
              animate={{ offset: ["0%", "0%", "0%", "0%", "0%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", times: [0, 0.6, 0.65, 0.75, 1] }}
            />
            <motion.stop
              stopColor="#BB65FF"
              animate={{ offset: ["35%", "20%", "35%", "35%", "35%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", times: [0, 0.6, 0.65, 0.75, 1] }}
            />
            <motion.stop
              offset="100%"
              stopColor="#78FFC6"
              animate={{ stopColor: ["#78FFC6", "#78FFC6", "#E5E5E5", "#E5E5E5", "#78FFC6"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", times: [0, 0.6, 0.65, 0.75, 1] }}
            />
          </radialGradient>
        </defs>

        <path
          d={path}
          stroke="#BB65FF"
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
          vectorEffect="non-scaling-stroke"
          style={{ filter: "drop-shadow(0 0 6px rgba(187, 101, 255, 0.5))" }}
        />

        <motion.circle
          cx={dot.x}
          cy={dot.y}
          r={4}
          fill={`url(#${gradientId})`}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{
            filter: "drop-shadow(0 0 8px rgba(120, 255, 198, 0.6))",
            transformOrigin: `${dot.x}px ${dot.y}px`,
          }}
        />
      </svg>
    </div>
  );
};

export default CurveIcon;
