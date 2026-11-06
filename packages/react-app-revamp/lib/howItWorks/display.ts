import { convertToDisplayPrice, type DisplayPriceOptions, type PriceDisplay } from "@hooks/useCurrency/useDisplayPrice";

const DEMO_NATIVE_SYMBOL = "USD";
const DEMO_RATES = { usd: 1 } as const;

export const CEILING_PRECISION: DisplayPriceOptions = { ceilingPrecision: true };

export const demoPriceDisplay = (native: string | number, options?: DisplayPriceOptions): PriceDisplay => {
  const { displayValue, displaySymbol } = convertToDisplayPrice(
    String(native),
    DEMO_NATIVE_SYMBOL,
    "usd",
    DEMO_RATES,
    {},
    undefined,
    options,
  );
  return { displayValue, displaySymbol };
};

export const formatDemoPrice = (native: string | number, options?: DisplayPriceOptions): string =>
  `$${demoPriceDisplay(native, options).displayValue}`;
