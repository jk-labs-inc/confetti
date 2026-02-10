import { ALCHEMY_PRICES_BASE_URL, NATIVE_TOKEN_SYMBOLS } from "@config/alchemy";
import { useQuery } from "@tanstack/react-query";

export const NATIVE_RATES_KEY = ["native-rates"] as const;

const ALCHEMY_KEY = process.env.NEXT_PUBLIC_ALCHEMY_KEY ?? "";

interface AlchemyPriceEntry {
  currency: string;
  value: string;
  lastUpdatedAt: string;
}

interface AlchemyBySymbolItem {
  symbol: string;
  prices: AlchemyPriceEntry[];
  error: { message: string } | null;
}

interface AlchemyBySymbolResponse {
  data: AlchemyBySymbolItem[];
}

/**
 * Fetches live USD prices for all supported native tokens directly from
 * the Alchemy Prices API `/tokens/by-symbol` endpoint.
 *
 * Returns a `Record<string, number>` keyed by **lowercase** symbol,
 * e.g. `{ eth: 2035.09, pol: 0.09, ... }` — the same shape the rest of
 * the currency system expects.
 */
const fetchNativePrices = async (): Promise<Record<string, number>> => {
  if (!ALCHEMY_KEY) {
    throw new Error("NEXT_PUBLIC_ALCHEMY_KEY is not configured.");
  }

  const params = new URLSearchParams();
  for (const sym of NATIVE_TOKEN_SYMBOLS) {
    params.append("symbols", sym);
  }

  const url = `${ALCHEMY_PRICES_BASE_URL}/${ALCHEMY_KEY}/tokens/by-symbol?${params.toString()}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Alchemy Prices API error: ${response.status}`);
  }

  const json: AlchemyBySymbolResponse = await response.json();

  const rates: Record<string, number> = {};

  for (const item of json.data) {
    if (item.error) continue;

    const usdPrice = item.prices.find(p => p.currency === "usd");

    if (usdPrice) {
      rates[item.symbol.toLowerCase()] = parseFloat(usdPrice.value);
    }
  }

  return rates;
};

/**
 * Fetches live USD prices for native chain tokens from the Alchemy Prices API.
 */
const useNativeRates = () => {
  return useQuery({
    queryKey: NATIVE_RATES_KEY,
    queryFn: fetchNativePrices,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

export default useNativeRates;
