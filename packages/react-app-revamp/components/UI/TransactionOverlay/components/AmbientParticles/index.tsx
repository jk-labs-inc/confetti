import { motion, useReducedMotion } from "motion/react";
import { memo, useLayoutEffect, useRef, useState } from "react";
import { lerp, pickParticleSvg, rand } from "../../constants";

const PARTICLE_COUNT = 16;
const SEED = 7;
const TRAVEL_OVERSHOOT = 1.15;

interface AmbientParticle {
  index: number;
  src: string;
  size: number;
  leftPct: number;
  duration: number;
  delay: number;
  swayX: number;
  maxOpacity: number;
  spinDeg: number;
}

const buildAmbientParticles = (): AmbientParticle[] =>
  Array.from({ length: PARTICLE_COUNT }, (_, index) => {
    const duration = lerp(9, 17, rand(SEED, index, 1));
    return {
      index,
      src: pickParticleSvg(SEED, index, 2),
      size: Math.round(lerp(6, 12, rand(SEED, index, 3))),
      leftPct: lerp(3, 97, rand(SEED, index, 4)),
      duration,
      // Negative delay starts each particle mid-journey so the field is full on mount.
      delay: -rand(SEED, index, 5) * duration,
      swayX: (rand(SEED, index, 6) - 0.5) * 36,
      maxOpacity: lerp(0.14, 0.32, rand(SEED, index, 7)),
      spinDeg: (rand(SEED, index, 8) < 0.5 ? -1 : 1) * lerp(140, 420, rand(SEED, index, 9)),
    };
  });

const AMBIENT_PARTICLES = buildAmbientParticles();

const AmbientParticles = () => {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [travel, setTravel] = useState<number | null>(null);

  useLayoutEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    setTravel(-Math.ceil(node.offsetHeight * TRAVEL_OVERSHOOT));
  }, [reduceMotion]);

  if (reduceMotion) return null;

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {travel !== null &&
        AMBIENT_PARTICLES.map(particle => (
          <motion.img
            key={particle.index}
            src={particle.src}
            width={particle.size}
            height={particle.size}
            alt=""
            draggable={false}
            className="absolute block"
            style={{ left: `${particle.leftPct}%`, top: "104%", willChange: "transform, opacity" }}
            initial={{ y: 0, x: 0, rotate: 0, opacity: 0 }}
            animate={{
              y: [0, travel],
              x: [0, particle.swayX, 0],
              rotate: [0, particle.spinDeg],
              opacity: [0, particle.maxOpacity, particle.maxOpacity, 0],
            }}
            transition={{
              y: { duration: particle.duration, delay: particle.delay, repeat: Infinity, ease: "linear" },
              x: { duration: particle.duration, delay: particle.delay, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: particle.duration, delay: particle.delay, repeat: Infinity, ease: "linear" },
              opacity: {
                duration: particle.duration,
                delay: particle.delay,
                repeat: Infinity,
                times: [0, 0.08, 0.9, 1],
              },
            }}
          />
        ))}
    </div>
  );
};

export default memo(AmbientParticles);
