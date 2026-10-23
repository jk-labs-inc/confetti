export const HOW_IT_WORKS_STEP_IDS = ["pool", "winner", "curve", "payout", "push", "late"] as const;

export type HowItWorksStepId = (typeof HOW_IT_WORKS_STEP_IDS)[number];

export type BubblesPose = "ballot" | "money" | "moneyPile" | "building" | "shy";

export interface BubblesLine {
  pose: BubblesPose;
  line: string;
}

export interface HowItWorksStep {
  id: HowItWorksStepId;
  headline: string;
  body: string;
  bubbles: BubblesLine;
}

const COPY: Record<HowItWorksStepId, Omit<HowItWorksStep, "id">> = {
  pool: {
    headline: "buy votes on your favorite entries.",
    body: "90% of your funds go into a rewards pool.",
    bubbles: { pose: "ballot", line: "best pet photo! who gets your vote?" },
  },
  winner: {
    headline: "vote on the winner,",
    body: "and claim your share of rewards.",
    bubbles: { pose: "money", line: "cool cat won! its voters split the pool." },
  },
  curve: {
    headline: "vote earlier to earn more.",
    body: "the price per vote keeps going up, so it's cheapest to vote early.",
    bubbles: { pose: "building", line: "same $10, fewer votes every minute." },
  },
  payout: {
    headline: "see how much you can make.",
    body: "estimated payout is how much you'd get if the contest ended now.",
    bubbles: { pose: "moneyPile", line: "type an amount, see your cut." },
  },
  push: {
    headline: "you might make the most",
    body: "by voting on low-ranking entries and driving them into first!",
    bubbles: { pose: "ballot", line: "go royal floof, go!" },
  },
  late: {
    headline: "but careful!",
    body: "wait too long and you could lose money… even if you vote on 1st.",
    bubbles: { pose: "shy", line: "oops. i voted way too late." },
  },
};

export const HOW_IT_WORKS_STEPS: readonly HowItWorksStep[] = HOW_IT_WORKS_STEP_IDS.map(id => ({ id, ...COPY[id] }));

export const HOW_IT_WORKS_STEP_COUNT = HOW_IT_WORKS_STEPS.length;
