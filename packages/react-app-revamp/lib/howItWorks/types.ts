import type { ChartDataPoint } from "@components/PriceCurve/types";
import type { PriceCurveType } from "@hooks/useDeployContest/types";
import type { HOW_IT_WORKS_STEP_IDS } from "lib/howItWorks/steps";

export type HowItWorksStepId = (typeof HOW_IT_WORKS_STEP_IDS)[number];

export type BubblesPose = "ballot" | "money" | "moneyPile" | "building" | "shy";

export type StepCopyText = readonly (string | { emphasis: string })[];

export interface HowItWorksStep {
  id: HowItWorksStepId;
  headline: string;
  body?: StepCopyText;
  pose: BubblesPose;
}

export type DemoDollars = number;

export interface DemoEntry {
  id: string;
  name: string;
  photoSrc: string;
  startVotes: number;
  votes: number;
  rank: number;
}

export interface DemoDeposit {
  entryId: string;
  voterSeed: string;
  spend: DemoDollars;
  toPool: DemoDollars;
  skimmed: DemoDollars;
  poolAfter: DemoDollars;
  votes: number;
}

export interface DemoWinnerVoter {
  seed: string;
  votes: number;
  payout: DemoDollars;
  isYou: boolean;
}

export interface DemoCurveBuy {
  pointIndex: number;
  spend: DemoDollars;
  votes: number;
}

export type DemoScenarioId = Extract<HowItWorksStepId, "payout" | "push" | "late">;

export interface DemoVoteScenario {
  entryId: string;
  spend: string;
  pricePerVote: string;
  currentPool: DemoDollars;
}

export interface DemoScript {
  contest: {
    percentageToRewards: number;
    firstPlaceSharePercentage: number;
    updateIntervalSeconds: number;
    startPrice: string;
    multiple: number;
    priceCurveType: PriceCurveType;
  };
  entries: readonly DemoEntry[];
  pool: { start: DemoDollars; deposits: readonly DemoDeposit[]; final: DemoDollars };
  winner: { entryId: string; voters: readonly DemoWinnerVoter[] };
  curve: {
    sameSpendBuys: readonly DemoCurveBuy[];
    chart: ChartDataPoint[];
  };
  scenarios: Record<DemoScenarioId, DemoVoteScenario>;
}
