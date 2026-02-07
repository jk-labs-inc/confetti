import { ParaOnrampNetwork } from "./types";

const CHAIN_TO_ONRAMP_NETWORK: Record<string, ParaOnrampNetwork> = {
  mainnet: ParaOnrampNetwork.ETHEREUM,
  ethereum: ParaOnrampNetwork.ETHEREUM,
  arbitrumone: ParaOnrampNetwork.ARBITRUM,
  base: ParaOnrampNetwork.BASE,
  polygon: ParaOnrampNetwork.POLYGON,
  celo: ParaOnrampNetwork.CELO,
};

/**
 * Check if a chain supports onramp functionality
 * @param chainName - The name of the chain (lowercase)
 * @returns true if the chain supports onramp
 */
export const isOnrampSupportedForChain = (chainName: string): boolean => {
  const normalizedChainName = chainName.toLowerCase().replace(/\s+/g, "");
  return normalizedChainName in CHAIN_TO_ONRAMP_NETWORK;
};

/**
 * Get the Para onramp network for a given chain
 * @param chainName - The name of the chain
 * @returns The ParaOnrampNetwork or undefined if not supported
 */
export const getOnrampNetworkForChain = (chainName: string): ParaOnrampNetwork | undefined => {
  const normalizedChainName = chainName.toLowerCase().replace(/\s+/g, "");
  return CHAIN_TO_ONRAMP_NETWORK[normalizedChainName];
};
