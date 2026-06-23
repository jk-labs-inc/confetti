import BigNumber from "bignumber.js";

// 1 billion
const MIN_VALUE_FOR_ABBREVIATION = 1_000_000_000;

const TARGET_USD_DECIMALS = 2; // target ~$0.01 per displayed step
const SMART_SIG_FIGS = 3;
const SMART_SIG_FIGS_NO_RATE = 4;
const SMART_MIN_DECIMALS = 0;
const SMART_MAX_DECIMALS = 8;
const SMART_ABBREVIATE_AT = 1_000_000;

function formatNumberAbbreviated(num: number): string {
  const abbreviations = [
    { value: 1e9, symbol: "b" },
    { value: 1e6, symbol: "m" },
    { value: 1e3, symbol: "k" },
  ];

  for (const { value, symbol } of abbreviations) {
    if (num >= value) {
      const formatted = parseFloat((num / value).toFixed(2)).toString();
      return `${formatted}${symbol}`;
    }
  }

  return num.toString();
}

function ceilAtDecimals(value: number, decimals: number): number {
  const multiplier = Math.pow(10, decimals);
  return Math.ceil(value * multiplier) / multiplier;
}

/**
 * Converts a number to a fixed-point decimal string, never using scientific notation.
 * e.g. 5.038e-8 → "0.00000005038..." instead of "5.038e-8"
 */
export const toFixedString = (num: number): string => {
  if (isNaN(num) || num === 0) return "0";
  return new BigNumber(num).toFixed();
};

export function formatBalance(balance: string, rounding: BigNumber.RoundingMode = BigNumber.ROUND_HALF_UP): string {
  const num = new BigNumber(balance);

  // handle zero
  if (num.isZero()) {
    return "0";
  }

  // handle small numbers (less than 0.001)
  if (num.abs().isLessThan(0.001)) {
    // For small numbers, use 6 decimal places
    return num.decimalPlaces(6, rounding).toString();
  }

  // handle numbers >= 0.001
  const rounded = num.decimalPlaces(5, rounding);

  // use abbreviated format for numbers >= 1000
  if (rounded.abs().isGreaterThanOrEqualTo(MIN_VALUE_FOR_ABBREVIATION)) {
    return formatNumberAbbreviated(rounded.toNumber());
  }

  return rounded.toString();
}

export function formatTokenAmountSmart(
  amount: string,
  usdUnitValue?: number,
  rounding: BigNumber.RoundingMode = BigNumber.ROUND_HALF_UP,
): string {
  const x = new BigNumber(amount);

  if (x.isNaN() || x.isZero()) {
    return "0";
  }

  const abs = x.abs();

  // large amounts → compact (e.g. "1.23m")
  if (abs.isGreaterThanOrEqualTo(SMART_ABBREVIATE_AT)) {
    return formatNumberAbbreviated(x.toNumber());
  }

  const magnitude = Math.floor(Math.log10(abs.toNumber()));
  let decimals: number;

  if (usdUnitValue !== undefined && Number.isFinite(usdUnitValue) && usdUnitValue > 0) {
    const valueAware = Math.ceil(Math.log10(usdUnitValue)) + TARGET_USD_DECIMALS;
    const sigFigFloor = SMART_SIG_FIGS - 1 - magnitude;
    decimals = Math.max(valueAware, sigFigFloor);
  } else {
    // no rate → pure significant figures.
    decimals = SMART_SIG_FIGS_NO_RATE - 1 - magnitude;
  }
  decimals = Math.min(SMART_MAX_DECIMALS, Math.max(SMART_MIN_DECIMALS, decimals));

  let rounded = x.decimalPlaces(decimals, rounding);

  // A real, non-zero amount that rounds to 0 at `decimals`: show the smallest
  // exact value rather than "0", or a "<floor" indicator if it's true dust.
  if (rounded.isZero()) {
    if (abs.isLessThan(`1e-${SMART_MAX_DECIMALS}`)) {
      return `${x.isNegative() ? "-" : ""}<0.${"0".repeat(SMART_MAX_DECIMALS - 1)}1`;
    }
    rounded = x.decimalPlaces(SMART_MAX_DECIMALS, rounding);
  }

  return rounded.toFixed(); // fixed-point, no scientific notation, trailing zeros trimmed
}

/**
 * Formats a number as a USD string (without the "$" prefix).
 * Uses a significant-digits approach for values under $1 so that
 * multiplier ratios stay visually correct.
 */
export function formatUsd(value: number): string {
  if (value === 0) return "0";

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

/**
 * Like `formatUsd`, but rounds UP at the chosen decimal precision instead
 * of half-up. Use for the per-vote price (header + "minimum to buy a
 * vote" label) so that a user who types the displayed value is
 * guaranteed to satisfy `floor(input / actualCost) >= 1`. With half-up
 * rounding, an actual cost of $0.025001 would display as `$0.025`, and
 * typing `0.025` would `floor` to 0 votes; with ceiling, the same value
 * displays as `$0.026`, which always satisfies the contract.
 */
export function formatUsdCeil(value: number): string {
  if (value === 0) return "0";

  if (value >= MIN_VALUE_FOR_ABBREVIATION) {
    return formatNumberAbbreviated(value);
  }

  if (value >= 100) {
    return Math.ceil(value).toLocaleString("en-US");
  }

  if (value >= 1) {
    return ceilAtDecimals(value, 2).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  // sub-dollar: ceil at the same 2-significant-digit precision `formatUsd` uses
  const magnitude = Math.floor(-Math.log10(Math.abs(value)));
  const decimalPlaces = Math.max(2, magnitude + 2);

  return ceilAtDecimals(value, decimalPlaces).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimalPlaces,
  });
}
