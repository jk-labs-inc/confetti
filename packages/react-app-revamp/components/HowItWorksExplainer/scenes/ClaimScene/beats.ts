import { arcPoint, flightEase } from "@components/HowItWorksExplainer/arc";
import { STAGE_WIDTH_PX } from "@components/HowItWorksExplainer/engine";
import { ENTRY_CARD_CENTER_X } from "@components/HowItWorksExplainer/realProps";
import type { ClaimBeats } from "@components/HowItWorksExplainer/scenes/ClaimScene/types";
import { CARD_SIZE_PX, CARD_TOP_PX } from "@components/HowItWorksExplainer/scenes/potStage";
import type { StagePoint } from "@components/HowItWorksExplainer/types";

const BUTTON_INTRO_AT_S = 0.2;
const STICKER_AT_S = 0.9;
const PRESS_AT_S = 2;
const LAUNCH_AFTER_PRESS_S = 0.15;
const CELEBRATE_S = 1.6;
const HOLD_S = 1.4;
const STILL_AFTER_LAND_S = 0.45;
const BILL_ARC_LIFT_PX = 30;
const BILL_ARC_LEAN = 0.15;

export const BILL_FLIGHT_S = 0.67;

export const BUTTON_LAYOUT_WIDTH_PX = 300;
export const BUTTON_WIDTH_PX = 240;
export const BUTTON_LEFT_PX = (STAGE_WIDTH_PX - BUTTON_WIDTH_PX) / 2;
export const BUTTON_TOP_PX = 190;

const BUTTON_HEIGHT_PX = 32;

export const BUTTON_TAP_POINT: StagePoint = { x: ENTRY_CARD_CENTER_X - 16, y: BUTTON_TOP_PX + BUTTON_HEIGHT_PX / 2 };
export const CARD_CENTER: StagePoint = { x: ENTRY_CARD_CENTER_X, y: CARD_TOP_PX + CARD_SIZE_PX / 2 };

const STICKER_POINT: StagePoint = { x: BUTTON_LEFT_PX + BUTTON_WIDTH_PX - 44, y: BUTTON_TOP_PX - 2 };

const launchAt = PRESS_AT_S + LAUNCH_AFTER_PRESS_S;
const landAt = launchAt + BILL_FLIGHT_S;

export const CLAIM_BEATS: ClaimBeats = {
  buttonIntroAt: BUTTON_INTRO_AT_S,
  stickerAt: STICKER_AT_S,
  pressAt: PRESS_AT_S,
  launchAt,
  landAt,
  durationS: landAt + CELEBRATE_S + HOLD_S,
  stillS: landAt + STILL_AFTER_LAND_S,
};

export const billPoint = (progress: number) => {
  const control = {
    x: STICKER_POINT.x + (CARD_CENTER.x - STICKER_POINT.x) * BILL_ARC_LEAN,
    y: CARD_CENTER.y - BILL_ARC_LIFT_PX,
  };
  return arcPoint(STICKER_POINT, control, CARD_CENTER, flightEase(progress));
};
