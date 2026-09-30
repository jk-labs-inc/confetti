const BASIS_POINTS = 10000n;
const BASIS_POINTS_PER_PERCENT = 100;
const WHOLE_NUMBER_THRESHOLD = 10;
const ONE_DECIMAL_THRESHOLD = 1;
const MINUS_SIGN = "−";

export const shareOfTotal = (part: number, total: number): number =>
  total > 0 ? Math.min(1, Math.max(0, part / total)) : 0;

export const calculateProfitPercentage = (rewards: bigint, spent: bigint): number => {
  if (spent === 0n) return 0;

  const profitBps = ((rewards - spent) * BASIS_POINTS) / spent;
  return Number(profitBps) / BASIS_POINTS_PER_PERCENT;
};

export const formatSharePercent = (fraction: number): string => {
  const percent = fraction * 100;
  if (percent <= 0) return "0%";
  if (percent >= WHOLE_NUMBER_THRESHOLD) return `${Math.round(percent)}%`;
  if (percent >= ONE_DECIMAL_THRESHOLD) return `${parseFloat(percent.toFixed(1))}%`;
  return `${parseFloat(percent.toPrecision(1))}%`;
};

export const formatPnlPercentage = (percentage: number): string => {
  const rounded = Math.round(Math.abs(percentage));
  return percentage < 0 ? `${MINUS_SIGN}${rounded}%` : `+${rounded}%`;
};
