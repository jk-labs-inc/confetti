import { POT_HEIGHT_PX, POT_RIM, POT_WIDTH_PX } from "@components/HowItWorksExplainer/actors/RewardsPot/geometry";
import { STAGE_WIDTH_PX } from "@components/HowItWorksExplainer/engine";
import { entryCardLeft } from "@components/HowItWorksExplainer/realProps";
import type { StagePoint } from "@components/HowItWorksExplainer/types";

const CARD_POT_GAP_PX = 14;

export const CARD_SIZE_PX = 120;
export const CARD_TOP_PX = 16;
export const CARD_LEFT_PX = entryCardLeft(CARD_SIZE_PX);
export const POT_TOP_PX = CARD_TOP_PX + CARD_SIZE_PX + CARD_POT_GAP_PX;
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
