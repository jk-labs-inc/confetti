import type { PileLayerTiming } from "@components/HowItWorksExplainer/actors/RewardsPot/types";
import type { SceneTiming } from "@components/HowItWorksExplainer/types";
import type { DemoDeposit } from "lib/howItWorks/types";

export interface DepositBeats {
  deposit: DemoDeposit;
  startX: number;
  launchAt: number;
  splitAt: number;
  landAt: number;
}

export interface PoolBeats extends SceneTiming {
  deposits: DepositBeats[];
  potIntroAt: number;
  fillStartAt: number;
  potLayers: PileLayerTiming[];
  finaleAt: number;
}
