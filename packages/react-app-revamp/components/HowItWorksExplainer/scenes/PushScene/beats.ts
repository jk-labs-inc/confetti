import { TYPE_AT_S, typingDoneAt } from "@components/HowItWorksExplainer/typing";
import type { SceneTiming } from "@components/HowItWorksExplainer/types";
import { demoPushFillAmount } from "lib/howItWorks/projections";
import { rankByVotes } from "lib/howItWorks/rank";
import type { DemoScript } from "lib/howItWorks/types";
import { votesFromSpend } from "lib/voteProjections";

const ZOOM_AFTER_TYPING_S = 0.6;
const PRESS_AFTER_ZOOM_S = 0.7;
const ZOOM_OUT_AFTER_PRESS_S = 0.8;
const CLIMB_AFTER_ZOOM_OUT_S = 0.25;
const POP_AFTER_CLIMB_S = 0.2;
const HOLD_AFTER_POP_S = 2.6;
const STILL_AFTER_POP_S = 0.9;

interface PushBeats extends SceneTiming {
  typeAt: number;
  zoomInAt: number;
  pressAt: number;
  zoomOutAt: number;
  climbAt: number;
  popAt: number;
  fillAmount: string;
  fillVotes: number;
}

export const pushBeats = (script: DemoScript): PushBeats => {
  const scenario = script.scenarios.push;
  const fillAmount = demoPushFillAmount(script, scenario) ?? scenario.spend;
  const zoomInAt = typingDoneAt(scenario.spend, TYPE_AT_S) + ZOOM_AFTER_TYPING_S;
  const pressAt = zoomInAt + PRESS_AFTER_ZOOM_S;
  const zoomOutAt = pressAt + ZOOM_OUT_AFTER_PRESS_S;
  const climbAt = zoomOutAt + CLIMB_AFTER_ZOOM_OUT_S;
  const popAt = climbAt + POP_AFTER_CLIMB_S;
  return {
    typeAt: TYPE_AT_S,
    zoomInAt,
    pressAt,
    zoomOutAt,
    climbAt,
    popAt,
    fillAmount,
    fillVotes: votesFromSpend(fillAmount, scenario.pricePerVote),
    durationS: popAt + HOLD_AFTER_POP_S,
    stillS: popAt + STILL_AFTER_POP_S,
  };
};

export const standingsAt = (script: DemoScript, beats: PushBeats, isPushed: boolean) => {
  const pushedId = script.scenarios.push.entryId;
  const votes = script.entries.map(entry =>
    isPushed && entry.id === pushedId ? entry.votes + beats.fillVotes : entry.votes,
  );
  const ranks = rankByVotes(votes);
  return votes.map((entryVotes, i) => ({ votes: entryVotes, rank: ranks[i] }));
};
