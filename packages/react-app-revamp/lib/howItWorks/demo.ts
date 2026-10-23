import { PriceCurveType } from "@hooks/useDeployContest/types";
import { calculateExponentialMultiple, generatePricePointsForType } from "lib/priceCurve";
import { votesFromSpend } from "lib/voteProjections";
import { parseEther } from "viem";

export type DemoDollars = number;

export interface DemoEntry {
  id: string;
  name: string;
  photoSrc: string;
  rank: number;
}

export interface DemoDeposit {
  entryId: string;
  voterSeed: string;
  spend: DemoDollars;
  toPool: DemoDollars;
  skimmed: DemoDollars;
  poolAfter: DemoDollars;
}

export interface DemoCurvePoint {
  percentThrough: number;
  pricePerVote: DemoDollars;
}

export interface DemoCurveBuy extends DemoCurvePoint {
  spend: DemoDollars;
  votes: number;
}

export interface DemoScript {
  contest: {
    percentageToRewards: number;
  };
  entries: readonly DemoEntry[];
  pool: { deposits: readonly DemoDeposit[]; final: DemoDollars };
  curve: { points: readonly DemoCurvePoint[]; sameSpendBuys: readonly DemoCurveBuy[] };
}

const PERCENTAGE_TO_REWARDS = 90;
const DEPOSIT_SPEND: DemoDollars = 10;
const CURVE_START_PRICE: DemoDollars = 0.01;
const CURVE_END_PRICE: DemoDollars = 0.08;
const CURVE_DURATION_MS = 100 * 60 * 1000;
const CURVE_UPDATE_INTERVAL_SECONDS = 60;
const CURVE_SPEND: DemoDollars = 10;
const CURVE_BUY_PERCENTS = [0, 50, 90] as const;
const DEMO_EPOCH = new Date(0);

const ENTRIES: readonly DemoEntry[] = [
  { id: "cool-cat", name: "cool cat", photoSrc: "/how-it-works/cool-cat.jpg", rank: 1 },
  { id: "banana-pup", name: "banana pup", photoSrc: "/how-it-works/banana-pup.jpg", rank: 2 },
  { id: "royal-floof", name: "royal floof", photoSrc: "/how-it-works/royal-floof.jpg", rank: 3 },
];

const DEPOSITS = [
  { entryId: "banana-pup", voterSeed: "bubbles.voter.alice" },
  { entryId: "cool-cat", voterSeed: "bubbles.voter.bo" },
  { entryId: "royal-floof", voterSeed: "bubbles.voter.hana" },
] as const;

const roundCents = (value: number): DemoDollars => Math.round(value * 100) / 100;

const buildDeposits = (): DemoDeposit[] => {
  let pool = 0;
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
    };
  });
};

const buildCurve = (): DemoScript["curve"] => {
  const multiple = calculateExponentialMultiple({ startPrice: CURVE_START_PRICE, endPrice: CURVE_END_PRICE });
  const prices = generatePricePointsForType(PriceCurveType.Exponential, {
    startPrice: Number(parseEther(String(CURVE_START_PRICE))),
    multiple,
    startTime: DEMO_EPOCH,
    endTime: new Date(DEMO_EPOCH.getTime() + CURVE_DURATION_MS),
    updateIntervalSeconds: CURVE_UPDATE_INTERVAL_SECONDS,
  });
  const points = prices.map((point, index) => ({
    percentThrough: (index / (prices.length - 1)) * 100,
    pricePerVote: Number(point.price),
  }));
  const priceAt = (percent: number) => prices[Math.round((percent / 100) * (prices.length - 1))].price;
  const sameSpendBuys = CURVE_BUY_PERCENTS.map(percentThrough => ({
    percentThrough,
    pricePerVote: Number(priceAt(percentThrough)),
    spend: CURVE_SPEND,
    votes: votesFromSpend(String(CURVE_SPEND), priceAt(percentThrough)),
  }));
  return { points, sameSpendBuys };
};

export const buildDemoScript = (): DemoScript => {
  const deposits = buildDeposits();
  return {
    contest: {
      percentageToRewards: PERCENTAGE_TO_REWARDS,
    },
    entries: ENTRIES,
    pool: { deposits, final: deposits[deposits.length - 1].poolAfter },
    curve: buildCurve(),
  };
};

export const DEMO_SCRIPT: DemoScript = buildDemoScript();

export const formatDemoDollars = (value: DemoDollars): string =>
  `$${value.toLocaleString("en-US", { maximumFractionDigits: value < 1 ? 3 : 0 })}`;
