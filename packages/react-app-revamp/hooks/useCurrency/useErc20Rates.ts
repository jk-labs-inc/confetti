import { ALCHEMY_PRICES_BASE_URL, CHAIN_TO_ALCHEMY_NETWORK } from "@config/alchemy";
import { useQuery } from "@tanstack/react-query";

const ALCHEMY_KEY = process.env.NEXT_PUBLIC_ALCHEMY_KEY ?? "";

interface AlchemyPriceEntry {
  currency: string;
  value: string;
  lastUpdatedAt: string;
}

interface AlchemyByAddressItem {
  network: string;
  address: string;
  prices: AlchemyPriceEntry[];
  error: { message: string } | null;
}

interface AlchemyByAddressResponse {
  data: AlchemyByAddressItem[];
}

/**
 * Fetches ERC-20 token USD prices directly from the Alchemy Prices API
 * `/tokens/by-address` endpoint.
 */
export const fetchErc20Prices = async (addresses: string[], chain: string): Promise<Record<string, number>> => {
  const network = CHAIN_TO_ALCHEMY_NETWORK[chain];

  if (!network) return {};

  if (!ALCHEMY_KEY) {
    throw new Error("NEXT_PUBLIC_ALCHEMY_KEY is not configured.");
  }

  const url = `${ALCHEMY_PRICES_BASE_URL}/${ALCHEMY_KEY}/tokens/by-address`;

  const body = {
    addresses: addresses.map(address => ({
      network,
      address,
    })),
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Alchemy Prices API error: ${response.status}`);
  }

  const json: AlchemyByAddressResponse = await response.json();

  const rates: Record<string, number> = {};

  for (const item of json.data) {
    if (item.error) continue;

    const usdPrice = item.prices.find(p => p.currency === "usd");

    if (usdPrice) {
      rates[item.address.toLowerCase()] = parseFloat(usdPrice.value);
    }
  }

  return rates;
};

/**
 * Fetches live USD prices for ERC-20 tokens on a given chain via the
 * Alchemy Prices API.
 */
const useErc20Rates = (tokenAddresses: string[], chainName: string) => {
  const sorted = [...tokenAddresses].map(a => a.toLowerCase()).sort();
  const enabled = sorted.length > 0 && !!CHAIN_TO_ALCHEMY_NETWORK[chainName];

  return useQuery({
    queryKey: ["erc20-rates-fetch", chainName, sorted.join(",")],
    queryFn: () => fetchErc20Prices(sorted, chainName),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: 2,
    enabled,
  });
};

export default useErc20Rates;
