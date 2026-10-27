import { TYPE_AT_S, typingDoneAt } from "@components/HowItWorksExplainer/typing";
import type { SceneTiming } from "@components/HowItWorksExplainer/types";
import { projectDemoVote } from "lib/howItWorks/projections";
import { rankByVotes } from "lib/howItWorks/rank";
import type { DemoScript } from "lib/howItWorks/types";
import { votesFromSpend } from "lib/voteProjections";

const PRESS_AFTER_TYPING_S = 1.2;
const RESHUFFLE_AFTER_PRESS_S = 0.15;
const POP_AFTER_PRESS_S = 0.35;
const HOLD_AFTER_POP_S = 2.6;
const STILL_AFTER_POP_S = 0.9;

interface PushBeats extends SceneTiming {
  typeAt: number;
  pressAt: number;
  reshuffleAt: number;
  popAt: number;
  fillAmount: string;
  fillVotes: number;
}

export const pushBeats = (script: DemoScript): PushBeats => {
  const scenario = script.scenarios.push;
  const fillAmount = projectDemoVote(script, scenario, scenario.spend).pushToFirstFillAmount ?? scenario.spend;
  const pressAt = typingDoneAt(scenario.spend, TYPE_AT_S) + PRESS_AFTER_TYPING_S;
  const popAt = pressAt + POP_AFTER_PRESS_S;
  return {
    typeAt: TYPE_AT_S,
    pressAt,
    reshuffleAt: pressAt + RESHUFFLE_AFTER_PRESS_S,
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
