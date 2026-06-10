import type { ReactNode } from "react";

export interface VoteCountPulseProps {
  votes: number;
  children: ReactNode;
}

export interface BurstParticle {
  index: number;
  src: string;
  size: number;
  leftPct: number;
  topPct: number;
  driftX: number;
  driftY: number;
  spinDeg: number;
  life: number;
  delay: number;
}

export interface VoteIncreaseState {
  id: number;
  withParticles: boolean;
}
