import BigNumber from "bignumber.js";
import { formatNumberAbbreviated } from "./formatNumber";

const MIN_VALUE_FOR_ABBREVIATION = 10_000;

export function formatBalance(balance: string): string {
  const num = new BigNumber(balance);

  // handle zero
  if (num.isZero()) {
    return "0";
  }

  // handle small numbers (less than 0.001)
  if (num.abs().isLessThan(0.001)) {
    // For small numbers, use 6 decimal places
    return num.decimalPlaces(6, BigNumber.ROUND_HALF_UP).toString();
  }

  // handle numbers >= 0.001
  const truncated = num.decimalPlaces(5, BigNumber.ROUND_HALF_UP);

  // use abbreviated format for numbers >= 1000
  if (truncated.abs().isGreaterThanOrEqualTo(MIN_VALUE_FOR_ABBREVIATION)) {
    return formatNumberAbbreviated(truncated.toNumber());
  }

  return truncated.toString();
}

/**
 * Formats a number as a USD string (without the "$" prefix).
 * Uses a significant-digits approach for values under $1 so that
 * multiplier ratios stay visually correct.
 */
export function formatUsd(value: number): string {
  if (value === 0) return "0.00";

  if (value > 0 && value < 0.001) return "<0.001";

  if (value >= MIN_VALUE_FOR_ABBREVIATION) {
    return formatNumberAbbreviated(value);
  }

  // For values >= $100, drop decimals entirely (e.g. "$2,124")
  if (value >= 100) {
    return Math.round(value).toLocaleString("en-US");
  }

  // For values >= $1, use 2 decimal places (e.g. "$48.30", "$3.25")
  if (value >= 1) {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  // For values between $0.001 and $1, use enough decimals for 2 significant digits
  // e.g. 0.014 → "0.014", 0.14 → "0.14", 0.0035 → "0.0035"
  const magnitude = Math.floor(-Math.log10(Math.abs(value)));
  const decimalPlaces = Math.max(2, magnitude + 2);

  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimalPlaces,
  });
}
