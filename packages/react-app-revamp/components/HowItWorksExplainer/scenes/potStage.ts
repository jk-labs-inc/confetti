import type { StagePoint } from "@components/HowItWorksExplainer/arc";
import { POT_HEIGHT_PX, POT_RIM, POT_WIDTH_PX } from "@components/HowItWorksExplainer/actors/RewardsPot/geometry";
import { STAGE_WIDTH_PX } from "@components/HowItWorksExplainer/engine";
import { ENTRY_CARD_SIZE_PX } from "@components/HowItWorksExplainer/realProps";

const CARD_POT_GAP_PX = 22;

export const CARD_TOP_PX = 24;
export const POT_TOP_PX = CARD_TOP_PX + ENTRY_CARD_SIZE_PX + CARD_POT_GAP_PX;
export const POT_LEFT_PX = (STAGE_WIDTH_PX - POT_WIDTH_PX) / 2;

interface PotPlacement {
  shiftX: number;
  shiftY: number;
  scale: number;
}

const RESTING: PotPlacement = { shiftX: 0, shiftY: 0, scale: 1 };

export const potMouth = ({ shiftX, shiftY, scale }: PotPlacement = RESTING): StagePoint => ({
  x: POT_LEFT_PX + POT_WIDTH_PX / 2 + shiftX + (POT_RIM.cx - POT_WIDTH_PX / 2) * scale,
  y: POT_TOP_PX + POT_HEIGHT_PX / 2 + shiftY + (POT_RIM.cy - POT_HEIGHT_PX / 2) * scale,
});
