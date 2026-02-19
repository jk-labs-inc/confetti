const WORKER_URL = process.env.NEXT_PUBLIC_COINBASE_ONRAMP_WORKER_URL || "";

const COINBASE_CHAIN_MAPPING: Record<string, string> = {
  ethereum: "ethereum",
  mainnet: "ethereum",
  base: "base",
  arbitrumone: "arbitrum",
  arbitrum: "arbitrum",
  optimism: "optimism",
  polygon: "polygon",
  avalanche: "avalanche-c-chain",
  bnb: "bnb-chain",
  zora: "zora",
  celo: "celo",
  gnosis: "gnosis",
  scroll: "scroll",
  linea: "linea",
};

export const isChainSupportedForOnramp = (chainName: string): boolean => {
  const normalized = chainName.toLowerCase().replace(/\s+/g, "");
  return normalized in COINBASE_CHAIN_MAPPING;
};

export const getBlockchainForChain = (chainName: string): string | undefined => {
  const normalized = chainName.toLowerCase().replace(/\s+/g, "");
  return COINBASE_CHAIN_MAPPING[normalized];
};

export const getOnrampUrl = (
  sessionToken: string,
  asset: string,
  presetFiatAmount = 5,
  fiatCurrency = "USD",
): string => {
  const params = new URLSearchParams({
    sessionToken,
    defaultAsset: asset.toUpperCase(),
    presetFiatAmount: String(presetFiatAmount),
    fiatCurrency,
    defaultExperience: "buy",
  });

  return `https://pay.coinbase.com/buy/select-asset?${params.toString()}`;
};

export const fetchSessionToken = async (
  address: string,
  chain: string,
  asset: string,
): Promise<string> => {
  if (!WORKER_URL) {
    throw new Error("Onramp worker URL is not configured");
  }

  const response = await fetch(`${WORKER_URL}/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, chain, asset }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error((error as { error?: string }).error || `Request failed with status ${response.status}`);
  }

  const data = (await response.json()) as { sessionToken: string };

  if (!data.sessionToken) {
    throw new Error("No session token received");
  }

  return data.sessionToken;
};
