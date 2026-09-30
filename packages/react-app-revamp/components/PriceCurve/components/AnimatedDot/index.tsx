import { motion } from "motion/react";
import React, { useId } from "react";

interface AnimatedDotProps {
  x: number;
  y: number;
  isHovered: boolean;
  radius?: number;
}

const DEFAULT_RADIUS = 8;

const AnimatedDot: React.FC<AnimatedDotProps> = ({ x, y, isHovered, radius = DEFAULT_RADIUS }) => {
  const gradient = useId();

  return (
    <g>
      {/* Define animated gradient */}
      <defs>
        <radialGradient id={gradient} cx="50%" cy="50%" r="50%">
          <motion.stop
            offset="0%"
            stopColor="#BB65FF"
            animate={{
              offset: ["0%", "0%", "0%", "0%", "0%"],
            }}
            transition={{
              duration: 2.999,
              delay: 0.001,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.6, 0.65, 0.75, 1],
            }}
          />
          <motion.stop
            stopColor="#BB65FF"
            animate={{
              offset: ["35%", "20%", "35%", "35%", "35%"],
              stopColor: ["#BB65FF", "#BB65FF", "#BB65FF", "#BB65FF", "#BB65FF"],
            }}
            transition={{
              duration: 2.999,
              delay: 0.001,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.6, 0.65, 0.75, 1],
            }}
          />
          <motion.stop
            offset="100%"
            stopColor="#78FFC6"
            animate={{
              stopColor: ["#78FFC6", "#78FFC6", "#E5E5E5", "#E5E5E5", "#78FFC6"],
            }}
            transition={{
              duration: 2.999,
              delay: 0.001,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.6, 0.65, 0.75, 1],
            }}
          />
        </radialGradient>
      </defs>

      {/* Single pulsating dot with animated gradient */}
      <motion.circle
        cx={x}
        cy={y}
        r={radius}
        fill={`url(#${gradient})`}
        initial={{
          scale: 1,
        }}
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 2.999,
          delay: 0.001,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          filter: "drop-shadow(0 0 4px rgba(187, 101, 255, 0.4))",
          transform: isHovered ? "scale(1.1)" : "scale(1)",
          transformOrigin: `${x}px ${y}px`,
        }}
      />
    </g>
  );
};

export default AnimatedDot;
