import type { ConfettiPieceSpec } from "@components/HowItWorksExplainer/actors/ConfettiBurst/types";
const CONFETTI_COLORS = ["#66DEFF", "#78FFC6", "#FF54CC", "#BB65FF", "#FFD60A"] as const;
const SPREAD_RAD = 1.25;
const MIN_SPEED_PX_PER_S = 110;
const EXTRA_SPEED_PX_PER_S = 120;
const MAX_SPIN_DEG_PER_S = 900;

export const CONFETTI_GRAVITY_PX_PER_S2 = 320;
export const CONFETTI_LIFETIME_S = 1.6;
export const CONFETTI_FADE_S = 0.4;

const mulberry32 = (seed: number) => {
  let t = seed + 0x6d2b79f5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
};

const seededRandom = (seed: string) => mulberry32(hashString(seed));

export const confettiPieces = (count: number): ConfettiPieceSpec[] =>
  Array.from({ length: count }, (_, i) => ({
    angle: -Math.PI / 2 + (seededRandom(`angle-${i}`) - 0.5) * 2 * SPREAD_RAD,
    speed: MIN_SPEED_PX_PER_S + seededRandom(`speed-${i}`) * EXTRA_SPEED_PX_PER_S,
    spin: (seededRandom(`spin-${i}`) - 0.5) * MAX_SPIN_DEG_PER_S,
    isStrip: seededRandom(`shape-${i}`) > 0.5,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  }));
