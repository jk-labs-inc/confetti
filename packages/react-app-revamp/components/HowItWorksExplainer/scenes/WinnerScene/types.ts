import type { PileLayerTiming } from "@components/HowItWorksExplainer/actors/RewardsPot/types";
import type { SceneTiming } from "@components/HowItWorksExplainer/types";
import type { DemoWinnerVoter } from "lib/howItWorks/types";

export interface PayoutBeats {
  voter: DemoWinnerVoter;
  inAt: number;
  launchAt: number;
  landAt: number;
}

export interface WinnerBeats extends SceneTiming {
  crownAt: number;
  moveAt: number;
  payouts: PayoutBeats[];
  potLayers: PileLayerTiming[];
  finaleAt: number;
}
