/**
 * Alchemy Prices API configuration.
 *
 * Docs: https://www.alchemy.com/docs/reference/prices-api-quickstart
 */

export const ALCHEMY_PRICES_BASE_URL = "https://api.g.alchemy.com/prices/v1";

/**
 * Uppercase symbols for every native token we want USD prices for.
 * Passed directly to the Alchemy `/tokens/by-symbol` endpoint.
 *
 */
export const NATIVE_TOKEN_SYMBOLS = [
  "ETH",
  "POL",
  "AVAX",
  "CELO",
  "METIS",
  "TIA",
  "IP",
  "S",
  "HYPE",
  "MON",
  "KUB",
] as const;

/**
 * Maps our internal chain names (as used in URL paths / chain config `name` field)
 * to Alchemy network enum strings used by the `/tokens/by-address` endpoint.
 *
 * Chains without an Alchemy Prices API network are intentionally omitted —
 * ERC-20 price lookups will gracefully fall back to native display for those.
 *
 * Reference: https://docs.alchemy.com/reference/supported-chains
 */
export const CHAIN_TO_ALCHEMY_NETWORK: Record<string, string> = {
  mainnet: "eth-mainnet",
  polygon: "polygon-mainnet",
  arbitrumone: "arb-mainnet",
  base: "base-mainnet",
  avalanche: "avax-mainnet",
  linea: "linea-mainnet",
  zksyncEra: "zksync-mainnet",
  sepolia: "eth-sepolia",
};
