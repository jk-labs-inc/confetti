import { chains } from "@config/wagmi/chains";

const chainIdByLowercasedName = new Map(chains.map(chain => [chain.name.toLowerCase(), chain.id]));

export function findChainIdByName(chainName: string | undefined): number | undefined {
  if (!chainName) return undefined;
  return chainIdByLowercasedName.get(chainName.toLowerCase());
}

export function getChainId(chainName: string) {
  return findChainIdByName(chainName) || 1;
}
