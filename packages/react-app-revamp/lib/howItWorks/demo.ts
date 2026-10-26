import type { ChartDataPoint } from "@components/PriceCurve/types";
import { convertToChartData } from "@hooks/usePriceCurveChartData";
import { PriceCurveType } from "@hooks/useDeployContest/types";
import type { PricePoint } from "lib/priceCurve/types";
import {
  calculateExponentialMultiple,
  calculateStaticMinuteToMinutePercentage,
  generatePricePointsForType,
} from "lib/priceCurve";
import { projectDemoVote } from "lib/howItWorks/projections";
import { rankByVotes } from "lib/howItWorks/rank";
import type { HowItWorksStepId } from "lib/howItWorks/steps";
import { votesFromSpend } from "lib/voteProjections";
import { parseEther } from "viem";

type DemoDollars = number;

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
    minuteIncrease: { percentageIncrease: number; isBelowThreshold: boolean };
  };
  scenarios: Record<DemoScenarioId, DemoVoteScenario>;
}

const PERCENTAGE_TO_REWARDS = 90;
const FIRST_PLACE_SHARE_PERCENTAGE = 100;
const PRICE_CURVE_TYPE = PriceCurveType.Exponential;
const DEPOSIT_SPEND: DemoDollars = 100;
const STARTING_POOL: DemoDollars = 1230;
const CURVE_START_PRICE: DemoDollars = 0.01;
const CURVE_END_PRICE: DemoDollars = 0.08;
const CURVE_DURATION_MS = 100 * 60 * 1000;
const CURVE_UPDATE_INTERVAL_SECONDS = 60;
const CURVE_SPEND: DemoDollars = 10;
const CURVE_BUY_PERCENTS = [0, 50, 90] as const;
const TYPED_SPEND = "20";
const PUSH_TYPED_SPEND = "5";
const EARLY_PERCENT = 0;
const LATE_PERCENT = 100;
const DEMO_EPOCH = new Date(0);

const CURVE_DURATION_MINUTES = CURVE_DURATION_MS / 60_000;
const CURVE_MULTIPLE = calculateExponentialMultiple({ startPrice: CURVE_START_PRICE, endPrice: CURVE_END_PRICE });
const STORY_LEADER_ID = "cool-cat";
const STORY_UNDERDOG_ID = "royal-floof";

const ENTRY_SEEDS: readonly Omit<DemoEntry, "votes" | "rank">[] = [
  { id: "cool-cat", name: "cool cat", photoSrc: "/how-it-works/cool-cat.jpg", startVotes: 24000 },
  { id: "banana-pup", name: "banana pup", photoSrc: "/how-it-works/banana-pup.jpg", startVotes: 17000 },
  { id: "royal-floof", name: "royal floof", photoSrc: "/how-it-works/royal-floof.jpg", startVotes: 9000 },
];

const DEPOSITS = [
  { entryId: "banana-pup", voterSeed: "bubbles.voter.alice" },
  { entryId: "cool-cat", voterSeed: "bubbles.voter.bo" },
  { entryId: "royal-floof", voterSeed: "bubbles.voter.hana" },
] as const;

const WINNER_EARLIER_VOTERS = [
  { seed: "0x76cf691686e23e7726b1fd817ea771d2bf415040", votes: 14000 },
  { seed: "0x32c94adb6b3202db2dc78d30ee3249ce2cf9623a", votes: 10000 },
] as const;

const roundCents = (value: number): DemoDollars => Math.round(value * 100) / 100;

const buildDeposits = (): DemoDeposit[] => {
  let pool = STARTING_POOL;
  const votes = votesFromSpend(String(DEPOSIT_SPEND), String(CURVE_START_PRICE));
  return DEPOSITS.map(({ entryId, voterSeed }) => {
    const toPool = roundCents((DEPOSIT_SPEND * PERCENTAGE_TO_REWARDS) / 100);
    pool = roundCents(pool + toPool);
    return {
      entryId,
      voterSeed,
      spend: DEPOSIT_SPEND,
      toPool,
      skimmed: roundCents(DEPOSIT_SPEND - toPool),
      poolAfter: pool,
      votes,
    };
  });
};

const buildPrices = () =>
  generatePricePointsForType(PRICE_CURVE_TYPE, {
    startPrice: Number(parseEther(String(CURVE_START_PRICE))),
    multiple: CURVE_MULTIPLE,
    startTime: DEMO_EPOCH,
    endTime: new Date(DEMO_EPOCH.getTime() + CURVE_DURATION_MS),
    updateIntervalSeconds: CURVE_UPDATE_INTERVAL_SECONDS,
  });

const curvePointIndex = (pointCount: number, percent: number) => Math.round((percent / 100) * (pointCount - 1));

const priceAt = (prices: readonly PricePoint[], percent: number) =>
  prices[curvePointIndex(prices.length, percent)].price;

const buildCurve = (prices: readonly PricePoint[]): DemoScript["curve"] => {
  const chart = convertToChartData([...prices]);
  const sameSpendBuys = CURVE_BUY_PERCENTS.map(percentThrough => ({
    pointIndex: curvePointIndex(prices.length, percentThrough),
    spend: CURVE_SPEND,
    votes: votesFromSpend(String(CURVE_SPEND), priceAt(prices, percentThrough)),
  }));
  const minuteIncrease = calculateStaticMinuteToMinutePercentage(
    CURVE_START_PRICE,
    CURVE_MULTIPLE,
    CURVE_DURATION_MINUTES,
  );
  return { sameSpendBuys, chart, minuteIncrease };
};

const buildEntries = (deposits: readonly DemoDeposit[]): DemoEntry[] => {
  const withVotes = ENTRY_SEEDS.map(entry => ({
    ...entry,
    votes: deposits.reduce(
      (sum, deposit) => (deposit.entryId === entry.id ? sum + deposit.votes : sum),
      entry.startVotes,
    ),
  }));
  const ranks = rankByVotes(withVotes.map(entry => entry.votes));
  return withVotes.map((entry, i) => ({ ...entry, rank: ranks[i] }));
};

const buildWinner = (entries: readonly DemoEntry[], deposits: readonly DemoDeposit[], pool: DemoDollars) => {
  const leader = entries.find(entry => entry.rank === 1) ?? entries[0];
  const yourVotes = deposits
    .filter(deposit => deposit.entryId === leader.id)
    .map(deposit => ({ seed: deposit.voterSeed, votes: deposit.votes, isYou: true }));
  const earlierVotes = WINNER_EARLIER_VOTERS.map(voter => ({ ...voter, isYou: false }));
  const firstPlacePool = (pool * FIRST_PLACE_SHARE_PERCENTAGE) / 100;
  return {
    entryId: leader.id,
    voters: [...yourVotes, ...earlierVotes].map(voter => ({
      ...voter,
      payout: roundCents((firstPlacePool * voter.votes) / leader.votes),
    })),
  };
};

const buildScenarios = (prices: readonly PricePoint[], currentPool: DemoDollars): DemoScript["scenarios"] => {
  const scenario = (entryId: string, spend: string, percentThrough: number): DemoVoteScenario => ({
    entryId,
    spend,
    pricePerVote: priceAt(prices, percentThrough),
    currentPool,
  });
  return {
    payout: scenario(STORY_LEADER_ID, TYPED_SPEND, EARLY_PERCENT),
    push: scenario(STORY_UNDERDOG_ID, PUSH_TYPED_SPEND, EARLY_PERCENT),
    late: scenario(STORY_LEADER_ID, TYPED_SPEND, LATE_PERCENT),
  };
};

const assertStory = (condition: boolean, message: string) => {
  if (!condition) throw new Error(`how-it-works demo: ${message}`);
};

const assertDemoStory = (script: DemoScript) => {
  const leader = script.entries.find(entry => entry.rank === 1);
  assertStory(leader?.id === STORY_LEADER_ID, `${STORY_LEADER_ID} must rank 1st`);
  const winnerVotes = script.winner.voters.reduce((sum, voter) => sum + voter.votes, 0);
  assertStory(winnerVotes === leader?.votes, "winner voters must add up to the leader's votes");

  const { payout, push, late } = script.scenarios;
  const payoutEntry = projectDemoVote(script, payout, payout.spend).entryProjection;
  assertStory(payoutEntry?.kind === "wouldWinNow" && !payoutEntry.isBelowSpend, "payout must not be below spend");

  const pushTyped = projectDemoVote(script, push, push.spend);
  assertStory(pushTyped.entryProjection?.kind === "pushToFirst", "push must start short of 1st");
  const pushFilled = projectDemoVote(script, push, pushTyped.pushToFirstFillAmount ?? "");
  assertStory(pushFilled.entryProjection?.kind === "wouldWinNow", "push fill must reach 1st");

  const lateEntry = projectDemoVote(script, late, late.spend).entryProjection;
  assertStory(lateEntry?.kind === "wouldWinNow" && lateEntry.isBelowSpend, "late must be below spend");
};

const buildDemoScript = (): DemoScript => {
  const deposits = buildDeposits();
  const prices = buildPrices();
  const entries = buildEntries(deposits);
  const finalPool = deposits[deposits.length - 1].poolAfter;
  const script: DemoScript = {
    contest: {
      percentageToRewards: PERCENTAGE_TO_REWARDS,
      firstPlaceSharePercentage: FIRST_PLACE_SHARE_PERCENTAGE,
      updateIntervalSeconds: CURVE_UPDATE_INTERVAL_SECONDS,
      startPrice: String(CURVE_START_PRICE),
      multiple: CURVE_MULTIPLE,
      priceCurveType: PRICE_CURVE_TYPE,
    },
    entries,
    pool: { start: STARTING_POOL, deposits, final: finalPool },
    winner: buildWinner(entries, deposits, finalPool),
    curve: buildCurve(prices),
    scenarios: buildScenarios(prices, finalPool),
  };
  if (process.env.NODE_ENV !== "production") assertDemoStory(script);
  return script;
};

export const DEMO_SCRIPT: DemoScript = buildDemoScript();

const WHOLE_DOLLARS = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const CENTS = new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 });

export const formatDemoDollars = (value: DemoDollars): string =>
  `$${(value < 1 ? CENTS : WHOLE_DOLLARS).format(value)}`;
