import { FrameLoader } from "@components/UI/Loader/FrameLoader";
import { motion, useReducedMotion } from "motion/react";
import { FC } from "react";
import { PARTICLE_SVGS } from "../../constants";

const MOUTH_X_PCT = 84.6;
const MOUTH_Y_PCT = 46.4;

interface FeedShard {
  src: string;
  size: number;
  startX: number;
  startY: number;
  spinDeg: number;
  duration: number;
  delay: number;
  repeatDelay: number;
}

const FEED_SHARDS: FeedShard[] = [
  {
    src: PARTICLE_SVGS[1],
    size: 11,
    startX: 96,
    startY: -26,
    spinDeg: 220,
    duration: 1.1,
    delay: 0.2,
    repeatDelay: 1.6,
  },
  {
    src: PARTICLE_SVGS[0],
    size: 8,
    startX: 118,
    startY: 14,
    spinDeg: -300,
    duration: 1.3,
    delay: 1.1,
    repeatDelay: 2.1,
  },
  { src: PARTICLE_SVGS[2], size: 9, startX: 84, startY: 34, spinDeg: 260, duration: 1.0, delay: 2.0, repeatDelay: 1.8 },
];

const FEED_SHARD_TRANSITIONS = FEED_SHARDS.map(shard => {
  const loop = {
    duration: shard.duration,
    delay: shard.delay,
    repeat: Infinity,
    repeatDelay: shard.repeatDelay,
    ease: "easeIn" as const,
  };

  return {
    x: loop,
    y: loop,
    rotate: { ...loop, ease: "linear" as const },
    opacity: { ...loop, times: [0, 0.2, 0.85, 1] },
    scale: { ...loop, times: [0, 0.85, 1] },
  };
});

interface ChompLoaderProps {
  size?: number;
}

const ChompLoader: FC<ChompLoaderProps> = ({ size = 160 }) => {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <FrameLoader size={size} />
      {!reduceMotion &&
        FEED_SHARDS.map((shard, index) => (
          <motion.img
            key={shard.src}
            src={shard.src}
            width={shard.size}
            height={shard.size}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="absolute block"
            style={{
              left: `${MOUTH_X_PCT}%`,
              top: `${MOUTH_Y_PCT}%`,
              marginLeft: -shard.size / 2,
              marginTop: -shard.size / 2,
              willChange: "transform, opacity",
            }}
            initial={{ x: shard.startX, y: shard.startY, rotate: 0, opacity: 0, scale: 1 }}
            animate={{
              x: [shard.startX, 0],
              y: [shard.startY, 0],
              rotate: [0, shard.spinDeg],
              opacity: [0, 1, 1, 0],
              scale: [1, 1, 0.4],
            }}
            transition={FEED_SHARD_TRANSITIONS[index]}
          />
        ))}
    </div>
  );
};

export default ChompLoader;
