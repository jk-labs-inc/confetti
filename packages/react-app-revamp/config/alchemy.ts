export const ALCHEMY_PRICES_BASE_URL = "https://api.g.alchemy.com/prices/v1";

/**
 * Uppercase symbols for every native token we want USD prices for.
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
