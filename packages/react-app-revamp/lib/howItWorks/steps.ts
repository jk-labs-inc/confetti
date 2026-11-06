import type { HowItWorksStep, HowItWorksStepId } from "lib/howItWorks/types";

export const HOW_IT_WORKS_STEP_IDS = ["pool", "winner", "payout", "curve", "late", "push"] as const;

const COPY: Record<HowItWorksStepId, Omit<HowItWorksStep, "id">> = {
  pool: {
    headline: "buy votes on your favorite entries.",
    body: ["90% of funds go into a rewards pool."],
    pose: "ballot",
  },
  winner: {
    headline: "vote on the winner and claim your share of rewards.",
    pose: "money",
  },
  payout: {
    headline: "see how much you can make.",
    body: ["estimated payout is how much you'd get if the contest ended now."],
    pose: "moneyPile",
  },
  curve: {
    headline: "vote earlier to earn more.",
    body: [
      "the price per vote keeps going up, so it's cheapest to vote early. higher risk, ",
      { emphasis: "higher reward" },
      ".",
    ],
    pose: "building",
  },
  late: {
    headline: "but be careful!",
    body: ["wait too long and you could lose money… even if you vote on the winner."],
    pose: "shy",
  },
  push: {
    headline: "pro tip",
    body: [
      "to earn more, vote on low-ranking entries and drive them into first. again… higher risk, ",
      { emphasis: "higher reward" },
      ".",
    ],
    pose: "ballot",
  },
};

export const HOW_IT_WORKS_STEPS: readonly HowItWorksStep[] = HOW_IT_WORKS_STEP_IDS.map(id => ({ id, ...COPY[id] }));

export const HOW_IT_WORKS_STEP_COUNT = HOW_IT_WORKS_STEPS.length;
