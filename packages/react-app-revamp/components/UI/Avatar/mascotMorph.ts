// https://www.smashingmagazine.com/2021/09/deep-dive-wonderful-world-svg-displacement-filtering/
// https://tympanus.net/codrops/2019/02/19/svg-filter-effects-creating-texture-with-feturbulence/

export const MASCOT_AVATAR_IMG = "/entry/no-votes-bubbles.png";

export const MASCOT_RECT = { x: -24, y: -18, w: 150, h: 150 } as const;

function hashInt(str: string): number {
  let h = 0;
  const s = str.toLowerCase();
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export interface MorphParams {
  id: string;
  hueRotate: number;
  turbSeed: number;
  baseFrequency: number;
  scale: number;
}

export function getMorphParams(seed: string): MorphParams {
  const h = hashInt(seed);
  const a = h;
  const b = (h >>> 4) ^ 0x9e3779;
  const c = (h >>> 9) ^ 0x1b3f2d;
  const e = (h >>> 17) ^ 0x2f6b1d;

  return {
    id: "m" + seed.toLowerCase().replace(/[^a-z0-9]/g, ""),
    hueRotate: e % 360,
    turbSeed: a % 997,
    baseFrequency: 0.006 + (b % 7) * 0.0026,
    scale: 4 + (c % 9),
  };
}
