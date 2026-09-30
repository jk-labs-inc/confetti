import { PARTICLE_SVGS } from "../VoteFeedback/particles";

const BURST_COUNT = 36;
const DRIFT_COUNT = 14;

export interface WinnerBurstPiece {
  index: number;
  src: string;
  size: number;
  leftPct: number;
  riseY: number;
  fallY: number;
  driftX: number;
  spinDeg: number;
  duration: number;
  delay: number;
}

export interface WinnerDriftPiece {
  index: number;
  src: string;
  size: number;
  leftPct: number;
  swayPx: number;
  spinDeg: number;
  durationS: number;
  delayS: number;
}

const rand = (index: number, salt: number): number => {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
};

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

const pickSvg = (index: number): string =>
  PARTICLE_SVGS[Math.floor(rand(index, 1) * PARTICLE_SVGS.length) % PARTICLE_SVGS.length];

const spinDirection = (index: number, salt: number): number => (rand(index, salt) < 0.5 ? -1 : 1);

export const WINNER_BURST_PIECES: WinnerBurstPiece[] = Array.from({ length: BURST_COUNT }, (_, index) => {
  const leftPct = lerp(8, 92, rand(index, 2));
  const outward = (leftPct - 50) / 50;
  return {
    index,
    src: pickSvg(index),
    size: Math.round(lerp(7, 13, rand(index, 3))),
    leftPct,
    riseY: -lerp(50, 140, rand(index, 4)),
    fallY: lerp(90, 220, rand(index, 5)),
    driftX: outward * lerp(40, 120, rand(index, 6)) + (rand(index, 7) - 0.5) * 40,
    spinDeg: spinDirection(index, 8) * lerp(240, 720, rand(index, 9)),
    duration: lerp(1.8, 2.6, rand(index, 10)),
    delay: rand(index, 11) * 0.25,
  };
});

export const WINNER_DRIFT_PIECES: WinnerDriftPiece[] = Array.from({ length: DRIFT_COUNT }, (_, index) => {
  const isLeftBand = index % 2 === 0;
  const durationS = lerp(6, 10, rand(index, 12));
  return {
    index,
    src: pickSvg(index + BURST_COUNT),
    size: Math.round(lerp(6, 11, rand(index, 13))),
    leftPct: isLeftBand ? lerp(-7, 6, rand(index, 14)) : lerp(94, 107, rand(index, 14)),
    swayPx: (isLeftBand ? -1 : 1) * lerp(6, 18, rand(index, 15)),
    spinDeg: spinDirection(index, 16) * lerp(180, 540, rand(index, 17)),
    durationS,
    delayS: -rand(index, 18) * durationS,
  };
});
