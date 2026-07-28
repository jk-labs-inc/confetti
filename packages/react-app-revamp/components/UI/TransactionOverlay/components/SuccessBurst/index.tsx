import { motion, useReducedMotion } from "motion/react";
import { memo } from "react";
import { lerp, pickParticleSvg, rand } from "../../constants";

const BURST_PARTICLE_COUNT = 26;
const SEED = 13;

interface BurstParticle {
  index: number;
  src: string;
  size: number;
  driftX: number;
  driftY: number;
  spinDeg: number;
  life: number;
  delay: number;
}

const buildBurstParticles = (): BurstParticle[] =>
  Array.from({ length: BURST_PARTICLE_COUNT }, (_, index) => {
    const angle = (index / BURST_PARTICLE_COUNT) * Math.PI * 2 + (rand(SEED, index, 1) - 0.5) * 0.5;
    const distance = lerp(90, 200, rand(SEED, index, 2));

    return {
      index,
      src: pickParticleSvg(SEED, index, 3),
      size: Math.round(lerp(6, 12, rand(SEED, index, 4))),
      driftX: Math.cos(angle) * distance,
      driftY: Math.sin(angle) * distance - lerp(10, 30, rand(SEED, index, 5)),
      spinDeg: (rand(SEED, index, 6) < 0.5 ? -1 : 1) * lerp(120, 340, rand(SEED, index, 7)),
      life: lerp(0.9, 1.4, rand(SEED, index, 8)),
      delay: rand(SEED, index, 9) * 0.15,
    };
  });

const BURST_PARTICLES = buildBurstParticles();

const SuccessBurst = () => {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return null;

  return (
    <span className="pointer-events-none absolute left-1/2 top-1/2" aria-hidden="true">
      {BURST_PARTICLES.map(particle => (
        <motion.img
          key={particle.index}
          src={particle.src}
          width={particle.size}
          height={particle.size}
          alt=""
          draggable={false}
          className="absolute block"
          style={{
            marginLeft: -particle.size / 2,
            marginTop: -particle.size / 2,
          }}
          initial={{ x: 0, y: 0, rotate: 0, scale: 0, opacity: 0 }}
          animate={{
            x: [0, particle.driftX],
            y: [0, particle.driftY],
            rotate: [0, particle.spinDeg],
            scale: [0, 1.2, 1, 0],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            delay: particle.delay,
            x: { duration: particle.life, ease: [0.16, 0.62, 0.3, 1] },
            y: { duration: particle.life, ease: [0.16, 0.62, 0.3, 1] },
            rotate: { duration: particle.life, ease: "linear" },
            scale: { duration: particle.life, times: [0, 0.22, 0.6, 1], ease: "easeOut" },
            opacity: { duration: particle.life, times: [0, 0.15, 0.7, 1] },
          }}
        />
      ))}
    </span>
  );
};

export default memo(SuccessBurst);
