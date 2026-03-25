import { FC, useMemo } from "react";
import { PARTICLE_SVGS } from "../../constants";

interface ConfettiParticlesProps {
  chartWidth: number;
  chartHeight: number;
  seed: number;
}

const generateConfettiParticles = (chartWidth: number, chartHeight: number, seed: number) => {
  const particles = [];
  const count = 10;
  for (let i = 0; i < count; i++) {
    const hash = ((seed + i * 7919) * 104729) % 1000;
    particles.push({
      x: (((hash * 3) % 1000) / 1000) * chartWidth,
      y: chartHeight * 0.3 + (((hash * 7) % 1000) / 1000) * chartHeight * 0.65,
      size: 4 + (hash % 3) * 2,
      svg: PARTICLE_SVGS[i % PARTICLE_SVGS.length],
      opacity: 0.2 + (hash % 4) * 0.05,
    });
  }
  return particles;
};

const ConfettiParticles: FC<ConfettiParticlesProps> = ({ chartWidth, chartHeight, seed }) => {
  const particles = useMemo(
    () => generateConfettiParticles(chartWidth, chartHeight, seed),
    [chartWidth, chartHeight, seed],
  );

  return (
    <>
      {particles.map((p, i) => (
        <image
          key={`confetti-${i}`}
          href={p.svg}
          x={p.x - p.size / 2}
          y={p.y - p.size / 2}
          width={p.size}
          height={p.size}
          opacity={p.opacity}
        />
      ))}
    </>
  );
};

export default ConfettiParticles;
