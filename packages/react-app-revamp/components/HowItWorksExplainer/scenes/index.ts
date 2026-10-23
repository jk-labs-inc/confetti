import type { SceneProps } from "@components/HowItWorksExplainer/engine";
import CurveStill from "@components/HowItWorksExplainer/scenes/CurveStill";
import LateStill from "@components/HowItWorksExplainer/scenes/LateStill";
import PayoutStill from "@components/HowItWorksExplainer/scenes/PayoutStill";
import PoolScene from "@components/HowItWorksExplainer/scenes/PoolScene";
import PushStill from "@components/HowItWorksExplainer/scenes/PushStill";
import WinnerStill from "@components/HowItWorksExplainer/scenes/WinnerStill";
import type { HowItWorksStepId } from "lib/howItWorks/steps";
import type { FC } from "react";

export const SCENES: Record<HowItWorksStepId, FC<SceneProps>> = {
  pool: PoolScene,
  winner: WinnerStill,
  curve: CurveStill,
  payout: PayoutStill,
  push: PushStill,
  late: LateStill,
};
