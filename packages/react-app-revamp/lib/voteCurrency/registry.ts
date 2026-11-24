import { chains } from "@config/wagmi";
import { isSameAddress } from "@helpers/isSameAddress";
import { Address, isAddressEqual, zeroAddress } from "viem";
import { TokenVoteCurrency, VoteCurrency } from "./types";

const NATIVE_VOTE_CURRENCY_DECIMALS = 18;

export class UnsupportedVoteCurrencyError extends Error {
  constructor(chainId: number, address: string) {
    super(`vote currency ${address} is not supported on chain ${chainId}`);
    this.name = "UnsupportedVoteCurrencyError";
  }
}

const buildChainVoteCurrency = (chain: (typeof chains)[number]): VoteCurrency => {
  if (chain.voteToken) return Object.freeze({ kind: "token", ...chain.voteToken });

  if (chain.nativeCurrency.decimals !== NATIVE_VOTE_CURRENCY_DECIMALS) {
    throw new Error(`chain ${chain.name} has a native coin with ${chain.nativeCurrency.decimals} decimals`);
  }

  return Object.freeze({
    kind: "native",
    symbol: chain.nativeCurrency.symbol,
    decimals: NATIVE_VOTE_CURRENCY_DECIMALS,
  });
};

const voteCurrencyByChainId = new Map<number, VoteCurrency>(
  chains.map(chain => [chain.id, buildChainVoteCurrency(chain)]),
);

export const voteCurrencyAddress = (voteCurrency: VoteCurrency): Address =>
  voteCurrency.kind === "token" ? voteCurrency.address : zeroAddress;

export function chainVoteCurrency(chainId: number): VoteCurrency {
  const voteCurrency = voteCurrencyByChainId.get(chainId);
  if (!voteCurrency) throw new Error(`chain ${chainId} is not in the chain registry`);
  return voteCurrency;
}

export function findChainVoteCurrency(chainId: number | undefined): VoteCurrency | undefined {
  return chainId === undefined ? undefined : voteCurrencyByChainId.get(chainId);
}

export function chainHasNativeCoin(chainId: number | undefined): boolean {
  return findChainVoteCurrency(chainId)?.kind !== "token";
}

export function assertChainHasNativeCoin(chainId: number | undefined, purpose: string): void {
  if (chainHasNativeCoin(chainId)) return;
  throw new Error(`chain ${chainId} has no native coin for ${purpose}`);
}

export const isVoteToken = (
  voteCurrency: VoteCurrency | undefined,
  tokenAddress: string | undefined,
): voteCurrency is TokenVoteCurrency =>
  voteCurrency?.kind === "token" && isSameAddress(voteCurrency.address, tokenAddress);

export function resolveVoteCurrency(chainId: number, address: Address): VoteCurrency {
  const voteCurrency = chainVoteCurrency(chainId);

  if (!isAddressEqual(voteCurrencyAddress(voteCurrency), address)) {
    throw new UnsupportedVoteCurrencyError(chainId, address);
  }

  return voteCurrency;
}
