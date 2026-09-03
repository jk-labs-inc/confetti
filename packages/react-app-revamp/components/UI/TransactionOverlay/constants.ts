// Brand confetti shards from /public/particles, shared with VoteFeedback and PriceCurve.
export const PARTICLE_SVGS = [
  "/particles/confetti-pink.svg",
  "/particles/confetti-purple.svg",
  "/particles/confetti-cyan.svg",
  "/particles/confetti-green.svg",
  "/particles/confetti-violet.svg",
] as const;

export const SUCCESS_DISMISS_MS = 2400;

export const SUCCESS_MASCOT_IMAGE = "/landing/bubbles-money.png";

export const VOTE_FLOW_TRACKING_ID = "votes_are_deploying_toast";
export const VOTE_SHARE_TRACKING_ID = "vote_share_on_x";

// Deterministic PRNG (same shape as VoteFeedback/particles.ts) so particle
// layouts are stable across renders without threading state around.
export function rand(seed: number, index: number, salt: number): number {
  let t = (Math.imul(seed ^ 0x9e3779b1, 0x85ebca6b) ^ Math.imul(index + 1, 0xc2b2ae35) ^ (salt * 0x27d4eb2f)) >>> 0;
  t += 0x6d2b79f5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export const pickParticleSvg = (seed: number, index: number, salt: number): string =>
  PARTICLE_SVGS[Math.floor(rand(seed, index, salt) * PARTICLE_SVGS.length) % PARTICLE_SVGS.length];
