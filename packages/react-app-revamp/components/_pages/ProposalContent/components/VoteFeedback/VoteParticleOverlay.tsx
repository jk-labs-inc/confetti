import { motion, useReducedMotion } from "motion/react";
import { FC, memo, useMemo } from "react";
import { buildParticles } from "./particles";
import { useVoteIncrease } from "./useVoteIncrease";

const ParticleField: FC<{ seed: number }> = ({ seed }) => {
  const particles = useMemo(() => buildParticles(seed), [seed]);

  return (
    <span className="pointer-events-none absolute inset-0 z-10 overflow-visible" aria-hidden="true">
      {particles.map(particle => (
        <motion.img
          key={particle.index}
          src={particle.src}
          width={particle.size}
          height={particle.size}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="absolute block"
          style={{
            left: `${particle.leftPct}%`,
            top: `${particle.topPct}%`,
            marginLeft: -particle.size / 2,
            marginTop: -particle.size / 2,
            willChange: "transform, opacity",
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

const VoteParticleOverlay: FC<{ votes: number }> = ({ votes }) => {
  const increase = useVoteIncrease(votes, true);
  const reduceMotion = useReducedMotion();

  if (increase === null || reduceMotion || !increase.withParticles) return null;
  return <ParticleField key={increase.id} seed={increase.id} />;
};

export default memo(VoteParticleOverlay);
