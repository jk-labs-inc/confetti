import { arcPoint, flightEase } from "@components/HowItWorksExplainer/arc";
import { PILE_LAYERS } from "@components/HowItWorksExplainer/actors/RewardsPot/geometry";
import type { WinnerBeats } from "@components/HowItWorksExplainer/scenes/WinnerScene/types";
import { potMouth } from "@components/HowItWorksExplainer/scenes/potStage";
import type { DemoScript } from "lib/howItWorks/types";

const CROWN_AT_S = 0.35;
const MOVE_AT_S = 1;
const VOTER_IN_AT_S = 1.15;
const VOTER_STAGGER_S = 0.12;
const FIRST_LAUNCH_S = 1.75;
const LAUNCH_EVERY_S = 0.6;
const FINALE_GAP_S = 0.25;
const FINALE_S = 1.6;
const HOLD_S = 1.4;
const PAY_ARC_LIFT_PX = 34;
const PAY_ARC_LEAN = 0.5;

export const PAY_FLIGHT_S = 0.5;
export const PAY_COUNT_S = 0.45;

export const WINNER_STAGE = {
  potShiftX: -82,
  potShiftY: 2,
  potScale: 0.75,
  voterLeft: 188,
  voterTop: 158,
  voterRowGap: 32,
  voterSize: 28,
};

const MOVED_POT_MOUTH = potMouth({
  shiftX: WINNER_STAGE.potShiftX,
  shiftY: WINNER_STAGE.potShiftY,
  scale: WINNER_STAGE.potScale,
});

export const winnerBeats = (script: DemoScript): WinnerBeats => {
  const payouts = script.winner.voters.map((voter, i) => {
    const launchAt = FIRST_LAUNCH_S + i * LAUNCH_EVERY_S;
    return { voter, inAt: VOTER_IN_AT_S + i * VOTER_STAGGER_S, launchAt, landAt: launchAt + PAY_FLIGHT_S };
  });
  const potLayers = PILE_LAYERS.map((_, k) => ({
    landAt: null,
    leaveAt: payouts[Math.min(PILE_LAYERS.length - 1 - k, payouts.length - 1)].launchAt,
  }));
  const finaleAt = payouts[payouts.length - 1].landAt + FINALE_GAP_S;
  return {
    crownAt: CROWN_AT_S,
    moveAt: MOVE_AT_S,
    payouts,
    potLayers,
    finaleAt,
    durationS: finaleAt + FINALE_S + HOLD_S,
    stillS: finaleAt + FINALE_S,
  };
};

export const voterRowTop = (index: number) => WINNER_STAGE.voterTop + index * WINNER_STAGE.voterRowGap;

export const payoutBillPoint = (index: number, progress: number) => {
  const end = {
    x: WINNER_STAGE.voterLeft + WINNER_STAGE.voterSize / 2,
    y: voterRowTop(index) + WINNER_STAGE.voterSize / 2,
  };
  const control = {
    x: MOVED_POT_MOUTH.x + (end.x - MOVED_POT_MOUTH.x) * PAY_ARC_LEAN,
    y: Math.min(MOVED_POT_MOUTH.y, end.y) - PAY_ARC_LIFT_PX,
  };
  return arcPoint(MOVED_POT_MOUTH, control, end, flightEase(progress));
};
