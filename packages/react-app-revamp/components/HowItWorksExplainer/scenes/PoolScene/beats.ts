import { arcPoint, flightEase } from "@components/HowItWorksExplainer/arc";
import { ENTRY_CARD_SIZE_PX, entryRowLeft } from "@components/HowItWorksExplainer/realProps";
import type { PoolBeats } from "@components/HowItWorksExplainer/scenes/PoolScene/types";
import { CARD_TOP_PX, potMouth } from "@components/HowItWorksExplainer/scenes/potStage";
import type { DemoScript } from "lib/howItWorks/types";

const FIRST_LAUNCH_S = 0.74;
const DEPOSIT_EVERY_S = 1.1;
const FINALE_GAP_S = 0.2;
const FINALE_S = 1.6;
const HOLD_S = 1.4;
const BILL_ARC_LIFT_PX = 18;
const BILL_ARC_LEAN = 0.2;
const BILL_START_INSET_PX = 4;

export const BILL_FLIGHT_S = 0.67;
export const BILL_SPLIT_PROGRESS = 0.45;
export const CARD_STAGGER_S = 0.13;
export const POT_MOUTH = potMouth();

export const poolBeats = (script: DemoScript): PoolBeats => {
  const deposits = script.pool.deposits.map((deposit, k) => {
    const launchAt = FIRST_LAUNCH_S + k * DEPOSIT_EVERY_S;
    return {
      deposit,
      entryIndex: script.entries.findIndex(entry => entry.id === deposit.entryId),
      launchAt,
      splitAt: launchAt + BILL_FLIGHT_S * BILL_SPLIT_PROGRESS,
      landAt: launchAt + BILL_FLIGHT_S,
    };
  });
  const potIntroAt = CARD_STAGGER_S * script.entries.length;
  const finaleAt = deposits[deposits.length - 1].landAt + FINALE_GAP_S;
  return {
    deposits,
    potIntroAt,
    potLayers: [potIntroAt, ...deposits.map(beat => beat.landAt)].map(landAt => ({ landAt, leaveAt: null })),
    finaleAt,
    durationS: finaleAt + FINALE_S + HOLD_S,
    stillS: finaleAt + FINALE_S,
  };
};

export const cardCenterX = (entryIndex: number) => entryRowLeft(entryIndex) + ENTRY_CARD_SIZE_PX / 2;

export const billPoint = (entryIndex: number, progress: number) => {
  const start = { x: cardCenterX(entryIndex), y: CARD_TOP_PX + ENTRY_CARD_SIZE_PX - BILL_START_INSET_PX };
  const control = { x: start.x + (POT_MOUTH.x - start.x) * BILL_ARC_LEAN, y: start.y - BILL_ARC_LIFT_PX };
  return arcPoint(start, control, POT_MOUTH, flightEase(progress));
};

export const liveVotesAt = (script: DemoScript, beats: PoolBeats, t: number) =>
  script.entries.map(entry =>
    beats.deposits.reduce(
      (sum, { deposit, launchAt }) => (deposit.entryId === entry.id && t >= launchAt ? sum + deposit.votes : sum),
      entry.startVotes,
    ),
  );
