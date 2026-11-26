import type { SceneTiming } from "@components/HowItWorksExplainer/types";

export interface ClaimBeats extends SceneTiming {
  buttonIntroAt: number;
  stickerAt: number;
  pressAt: number;
  launchAt: number;
  landAt: number;
}
