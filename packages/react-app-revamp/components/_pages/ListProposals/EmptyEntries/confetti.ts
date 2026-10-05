import { PARTICLE_SVGS } from "@components/_pages/ProposalContent/components/VoteFeedback/particles";

export interface LandedConfettiPiece {
  src: string;
  sizePx: number;
  offsetXPx: number;
  restYPx: number;
  spinDeg: number;
  fromXPx: number;
  fromYPx: number;
  delayS: number;
  durationS: number;
}

const [PINK, PURPLE, CYAN, GREEN, VIOLET] = PARTICLE_SVGS;

export const FLOOR_CONFETTI: LandedConfettiPiece[] = [
  {
    src: PINK,
    sizePx: 8,
    offsetXPx: -132,
    restYPx: 2,
    spinDeg: 34,
    fromXPx: 26,
    fromYPx: -300,
    delayS: 0.1,
    durationS: 2.2,
  },
  {
    src: CYAN,
    sizePx: 7,
    offsetXPx: -104,
    restYPx: 6,
    spinDeg: -62,
    fromXPx: -18,
    fromYPx: -260,
    delayS: 0.45,
    durationS: 1.9,
  },
  {
    src: GREEN,
    sizePx: 9,
    offsetXPx: -78,
    restYPx: 1,
    spinDeg: 118,
    fromXPx: 30,
    fromYPx: -320,
    delayS: 0.25,
    durationS: 2.4,
  },
  {
    src: PURPLE,
    sizePx: 7,
    offsetXPx: -52,
    restYPx: 4,
    spinDeg: -20,
    fromXPx: -24,
    fromYPx: -280,
    delayS: 0.75,
    durationS: 2,
  },
  {
    src: VIOLET,
    sizePx: 8,
    offsetXPx: 48,
    restYPx: 3,
    spinDeg: 76,
    fromXPx: 22,
    fromYPx: -290,
    delayS: 0.35,
    durationS: 2.2,
  },
  {
    src: PINK,
    sizePx: 10,
    offsetXPx: 72,
    restYPx: 0,
    spinDeg: -128,
    fromXPx: -30,
    fromYPx: -330,
    delayS: 0.05,
    durationS: 2.5,
  },
  {
    src: CYAN,
    sizePx: 7,
    offsetXPx: 100,
    restYPx: 5,
    spinDeg: 12,
    fromXPx: 18,
    fromYPx: -270,
    delayS: 0.6,
    durationS: 1.9,
  },
  {
    src: GREEN,
    sizePx: 8,
    offsetXPx: 128,
    restYPx: 2,
    spinDeg: -84,
    fromXPx: -22,
    fromYPx: -300,
    delayS: 0.9,
    durationS: 2.1,
  },
];

export const HEAD_CONFETTI: LandedConfettiPiece = {
  src: CYAN,
  sizePx: 8,
  offsetXPx: 6,
  restYPx: 95,
  spinDeg: 24,
  fromXPx: -14,
  fromYPx: -220,
  delayS: 1.3,
  durationS: 2,
};
