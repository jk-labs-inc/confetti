import type { SceneProps } from "@components/HowItWorksExplainer/engine";
import CurveScene from "@components/HowItWorksExplainer/scenes/CurveScene";
import LateScene from "@components/HowItWorksExplainer/scenes/LateScene";
import PayoutScene from "@components/HowItWorksExplainer/scenes/PayoutScene";
import PoolScene from "@components/HowItWorksExplainer/scenes/PoolScene";
import PushScene from "@components/HowItWorksExplainer/scenes/PushScene";
import WinnerScene from "@components/HowItWorksExplainer/scenes/WinnerScene";
import type { HowItWorksStepId } from "lib/howItWorks/steps";
import type { FC } from "react";

export const SCENES: Record<HowItWorksStepId, FC<SceneProps>> = {
  pool: PoolScene,
  winner: WinnerScene,
  curve: CurveScene,
  payout: PayoutScene,
  push: PushScene,
  late: LateScene,
};
