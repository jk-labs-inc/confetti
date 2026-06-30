import { BurstParticle } from "./types";

// Brand confetti shards shared with `components/PriceCurve` (see `/public/particles`).
export const PARTICLE_SVGS = [
  "/particles/confetti-pink.svg",
  "/particles/confetti-purple.svg",
  "/particles/confetti-cyan.svg",
  "/particles/confetti-green.svg",
  "/particles/confetti-violet.svg",
] as const;

export const PARTICLE_COUNT = 20;
export const OVERLAY_DURATION_MS = 1900;

function rand(seed: number, index: number, salt: number): number {
  let t = (Math.imul(seed ^ 0x9e3779b1, 0x85ebca6b) ^ Math.imul(index + 1, 0xc2b2ae35) ^ (salt * 0x27d4eb2f)) >>> 0;
  t += 0x6d2b79f5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

// Shards seeded clockwise around the card perimeter, each launched outward (perpendicular to its
// edge) with tangential scatter; per-particle delay follows perimeter position so it sweeps around.
export function buildParticles(seed: number): BurstParticle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, index) => {
    // Perimeter parameter in [0, 1): 0 = top-left, increasing clockwise.
    const jitter = (rand(seed, index, 1) - 0.5) * (0.7 / PARTICLE_COUNT);
    const perimeter = ((index + 0.5) / PARTICLE_COUNT + jitter + 1) % 1;

    // Map onto an edge: position along it + the outward normal (nx, ny).
    let leftPct: number;
    let topPct: number;
    let nx: number;
    let ny: number;
    if (perimeter < 0.25) {
      leftPct = lerp(4, 96, perimeter / 0.25);
      topPct = 0;
      nx = 0;
      ny = -1;
    } else if (perimeter < 0.5) {
      leftPct = 100;
      topPct = lerp(4, 96, (perimeter - 0.25) / 0.25);
      nx = 1;
      ny = 0;
    } else if (perimeter < 0.75) {
      leftPct = lerp(96, 4, (perimeter - 0.5) / 0.25);
      topPct = 100;
      nx = 0;
      ny = 1;
    } else {
      leftPct = 0;
      topPct = lerp(96, 4, (perimeter - 0.75) / 0.25);
      nx = -1;
      ny = 0;
    }

    const distance = lerp(12, 38, rand(seed, index, 2));
    const tangent = (rand(seed, index, 3) - 0.5) * 26;

    return {
      index,
      src: PARTICLE_SVGS[Math.floor(rand(seed, index, 9) * PARTICLE_SVGS.length) % PARTICLE_SVGS.length],
      size: Math.round(lerp(5, 10, rand(seed, index, 10))),
      leftPct,
      topPct,
      driftX: nx * distance + -ny * tangent,
      driftY: ny * distance + nx * tangent - lerp(4, 12, rand(seed, index, 4)),
      spinDeg: (rand(seed, index, 5) < 0.5 ? -1 : 1) * lerp(120, 340, rand(seed, index, 6)),
      life: lerp(0.9, 1.3, rand(seed, index, 8)),
      delay: perimeter * 0.5 + rand(seed, index, 7) * 0.06,
    };
  });
}
