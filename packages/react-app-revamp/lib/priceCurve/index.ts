import { PriceCurveType } from "@hooks/useDeployContest/types";
import { formatEther, parseEther } from "viem";
import { PERCENTAGE_INCREASE_THRESHOLD } from "./constants";
import {
  ExponentialPricingInput,
  GeneratePricePointsParams,
  LogarithmicPricingInput,
  PricePoint,
  PricePointInternal,
} from "./types";

// Solves c in y = 2^(cx) so f(100) = endPrice/startPrice. Becomes on-chain `multiple`.
export const calculateExponentialMultiple = (input: ExponentialPricingInput): number => {
  const { startPrice, endPrice } = input;

  if (endPrice <= startPrice) {
    throw new Error("End price must be greater than start price");
  }

  const terminalMultiple = endPrice / startPrice;
  const c = Math.log2(terminalMultiple) / 100;

  return c;
};

// Exponential price at x: y = startPrice * 2^(multiple * x).
export const calculateEndPrice = (startPrice: number, multiple: number, x: number = 100): bigint => {
  if (startPrice <= 0) {
    throw new Error("Start price must be greater than 0");
  }

  const endPrice = startPrice * Math.pow(2, multiple * x);

  return BigInt(Math.round(endPrice));
};

// Exp curve has constant per-minute rate, so this is computed once per contest.
export const calculateStaticMinuteToMinutePercentage = (
  costToVote: number,
  multiple: number,
  totalMinutes: number,
): { percentageIncrease: number; isBelowThreshold: boolean } => {
  if (costToVote <= 0) {
    throw new Error("Cost to vote must be greater than 0");
  }

  if (totalMinutes <= 0) {
    throw new Error("Total minutes must be greater than 0");
  }

  const priceAtMinuteN = costToVote * Math.pow(2, multiple * (1 / totalMinutes) * 100);
  const priceAtMinuteNPlus1 = costToVote * Math.pow(2, multiple * (2 / totalMinutes) * 100);

  const percentageIncrease = ((priceAtMinuteNPlus1 - priceAtMinuteN) / priceAtMinuteN) * 100;
  const isBelowThreshold = percentageIncrease < PERCENTAGE_INCREASE_THRESHOLD;
  const percentageIncreaseRounded = Math.floor(percentageIncrease * 10) / 10;

  return {
    percentageIncrease: percentageIncreaseRounded,
    isBelowThreshold,
  };
};

export const generatePricePoints = (params: GeneratePricePointsParams): PricePoint[] => {
  const { startPrice, multiple, startTime, endTime, updateIntervalSeconds = 60 } = params;

  if (startPrice <= 0) {
    throw new Error("Start price must be greater than 0");
  }

  if (endTime <= startTime) {
    throw new Error("End time must be after start time");
  }

  if (updateIntervalSeconds <= 0) {
    throw new Error("Update interval must be greater than 0");
  }

  const totalDurationMs = endTime.getTime() - startTime.getTime();
  const totalDurationSeconds = Math.floor(totalDurationMs / 1000);

  if (totalDurationSeconds <= 0) {
    throw new Error("Duration must be greater than 0 seconds");
  }

  const pricePoints: PricePointInternal[] = [];
  const startPriceBigInt = BigInt(Math.round(startPrice));

  pricePoints.push({
    date: startTime,
    priceBigInt: startPriceBigInt,
  });

  // Plot the unrounded curve; contract floors prices on-chain (delta < 1e-6 ETH, not visible).
  for (let seconds = updateIntervalSeconds; seconds < totalDurationSeconds; seconds += updateIntervalSeconds) {
    const percentThrough = (seconds / totalDurationSeconds) * 100;
    const priceFloat = startPrice * Math.pow(2, multiple * percentThrough);
    const priceBigInt = BigInt(Math.round(priceFloat));

    const pointDate = new Date(startTime.getTime() + seconds * 1000);

    pricePoints.push({
      date: pointDate,
      priceBigInt,
    });
  }

  const endPriceFloat = startPrice * Math.pow(2, multiple * 100);
  const endPriceBigInt = BigInt(Math.round(endPriceFloat));

  pricePoints.push({
    date: endTime,
    priceBigInt: endPriceBigInt,
  });

  const formattedPricePoints: PricePoint[] = pricePoints.map(point => ({
    date: point.date.toISOString(),
    price: formatEther(point.priceBigInt),
  }));

  return formattedPricePoints;
};

// Log curve y = log10(b*x + 1) + c with c = startPrice (ETH). Solves b so f(100) = c * multiplier.
// b depends on BOTH startPrice and multiplier (unlike exponential).
export const calculateLogarithmicMultiple = (input: LogarithmicPricingInput): number => {
  const { startPrice, multiplier } = input;

  if (startPrice <= 0) {
    throw new Error("Start price must be greater than 0");
  }

  if (multiplier <= 1) {
    throw new Error("Multiplier must be greater than 1");
  }

  return (Math.pow(10, startPrice * (multiplier - 1)) - 1) / 100;
};

// Log price at x in wei: y = log10(b*x + 1) + (startPrice / 1e18). startPrice is in wei.
export const calculateLogarithmicEndPrice = (startPrice: number, multiple: number, x: number = 100): bigint => {
  if (startPrice <= 0) {
    throw new Error("Start price must be greater than 0");
  }

  const cInEth = startPrice / 1e18;
  const priceInEth = Math.log10(multiple * x + 1) + cInEth;

  return parseEther(priceInEth.toFixed(18));
};

export const generateLogarithmicPricePoints = (params: GeneratePricePointsParams): PricePoint[] => {
  const { startPrice, multiple, startTime, endTime, updateIntervalSeconds = 60 } = params;

  if (startPrice <= 0) {
    throw new Error("Start price must be greater than 0");
  }

  if (endTime <= startTime) {
    throw new Error("End time must be after start time");
  }

  if (updateIntervalSeconds <= 0) {
    throw new Error("Update interval must be greater than 0");
  }

  const totalDurationMs = endTime.getTime() - startTime.getTime();
  const totalDurationSeconds = Math.floor(totalDurationMs / 1000);

  if (totalDurationSeconds <= 0) {
    throw new Error("Duration must be greater than 0 seconds");
  }

  const cInEth = startPrice / 1e18;

  const pricePoints: PricePointInternal[] = [];

  pricePoints.push({
    date: startTime,
    priceBigInt: BigInt(Math.round(startPrice)),
  });

  for (let seconds = updateIntervalSeconds; seconds < totalDurationSeconds; seconds += updateIntervalSeconds) {
    const percentThrough = (seconds / totalDurationSeconds) * 100;
    const priceInEth = Math.log10(multiple * percentThrough + 1) + cInEth;
    const priceFloat = priceInEth * 1e18;

    const pointDate = new Date(startTime.getTime() + seconds * 1000);

    pricePoints.push({
      date: pointDate,
      priceBigInt: BigInt(Math.round(priceFloat)),
    });
  }

  const endPriceInEth = Math.log10(multiple * 100 + 1) + cInEth;
  const endPriceFloat = endPriceInEth * 1e18;

  pricePoints.push({
    date: endTime,
    priceBigInt: BigInt(Math.round(endPriceFloat)),
  });

  return pricePoints.map(point => ({
    date: point.date.toISOString(),
    price: formatEther(point.priceBigInt),
  }));
};

// Log rate-of-change is non-constant (faster early, slower late), so recompute per tick.
export const calculateDynamicLogPercentage = (
  costToVote: number,
  multiple: number,
  totalMinutes: number,
  elapsedMinutes: number,
): { percentageIncrease: number; isBelowThreshold: boolean } => {
  if (costToVote <= 0) {
    throw new Error("Cost to vote must be greater than 0");
  }

  if (totalMinutes <= 0) {
    throw new Error("Total minutes must be greater than 0");
  }

  const cInEth = costToVote / 1e18;

  const clampedElapsed = Math.max(0, Math.min(elapsedMinutes, totalMinutes - 1));
  const percentNow = (clampedElapsed / totalMinutes) * 100;
  const percentNext = ((clampedElapsed + 1) / totalMinutes) * 100;

  const priceNow = Math.log10(multiple * percentNow + 1) + cInEth;
  const priceNext = Math.log10(multiple * percentNext + 1) + cInEth;

  if (priceNow <= 0) {
    return { percentageIncrease: 0, isBelowThreshold: true };
  }

  const percentageIncrease = ((priceNext - priceNow) / priceNow) * 100;
  const isBelowThreshold = percentageIncrease < PERCENTAGE_INCREASE_THRESHOLD;
  const percentageIncreaseRounded = Math.floor(percentageIncrease * 10) / 10;

  return {
    percentageIncrease: percentageIncreaseRounded,
    isBelowThreshold,
  };
};

export const calculateEndPriceForType = (
  type: PriceCurveType,
  startPrice: number,
  multiple: number,
  x: number = 100,
): bigint => {
  if (type === PriceCurveType.Logarithmic) {
    return calculateLogarithmicEndPrice(startPrice, multiple, x);
  }
  return calculateEndPrice(startPrice, multiple, x);
};

export const generatePricePointsForType = (type: PriceCurveType, params: GeneratePricePointsParams): PricePoint[] => {
  if (type === PriceCurveType.Logarithmic) {
    return generateLogarithmicPricePoints(params);
  }
  return generatePricePoints(params);
};
