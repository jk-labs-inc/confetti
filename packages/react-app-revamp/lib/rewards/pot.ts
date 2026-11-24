import { isSameAddress } from "@helpers/isSameAddress";
import { FilteredToken } from "@hooks/useTokenList";
import {
  assertChainHasNativeCoin,
  chainHasNativeCoin,
  findChainVoteCurrency,
  isVoteToken,
  TokenVoteCurrency,
} from "lib/voteCurrency";
import { KnownRewardTokens, TotalRewardsData } from "./types";

const VOTE_TOKEN_FALLBACK_LOGO = "/confetti/loader/frame-1.svg";

export const voteTokenListItem = (voteToken: TokenVoteCurrency, chainLogo: string | undefined): FilteredToken => ({
  address: voteToken.address,
  name: voteToken.symbol,
  symbol: voteToken.symbol,
  logoURI: chainLogo || VOTE_TOKEN_FALLBACK_LOGO,
  decimals: voteToken.decimals,
});

export const nativePotRankings = (chainId: number | undefined, rankings: number[]): number[] =>
  chainHasNativeCoin(chainId) ? rankings : [];

export function potTokenAddresses(chainId: number | undefined, listedTokenAddresses: string[]): string[];
export function potTokenAddresses(
  chainId: number | undefined,
  listedTokenAddresses: string[] | undefined,
): string[] | undefined;
export function potTokenAddresses(
  chainId: number | undefined,
  listedTokenAddresses: string[] | undefined,
): string[] | undefined {
  const voteCurrency = findChainVoteCurrency(chainId);
  if (voteCurrency?.kind !== "token") return listedTokenAddresses;

  return [
    voteCurrency.address,
    ...(listedTokenAddresses ?? []).filter(tokenAddress => !isSameAddress(tokenAddress, voteCurrency.address)),
  ];
}

export const isVoteTokenOfPot = (chainId: number | undefined, tokenAddress: string): boolean =>
  isVoteToken(findChainVoteCurrency(chainId), tokenAddress);

export const knownPotTokens = (chainId: number | undefined, tokenAddresses: readonly string[]): KnownRewardTokens => {
  const voteCurrency = findChainVoteCurrency(chainId);
  const known: KnownRewardTokens = { symbols: {}, decimals: {} };

  for (const tokenAddress of tokenAddresses) {
    if (!isVoteToken(voteCurrency, tokenAddress)) continue;
    known.symbols[tokenAddress] = voteCurrency.symbol;
    known.decimals[tokenAddress] = voteCurrency.decimals;
  }

  return known;
};

export const isPotUnfunded = (chainId: number | undefined, pot: TotalRewardsData): boolean =>
  !pot.native.value &&
  Object.entries(pot.tokens).every(([tokenAddress, token]) => isVoteTokenOfPot(chainId, tokenAddress) && !token.value);

export function assertPotIncludesVoteToken(chainId: number | undefined, pot: TotalRewardsData): void {
  if (chainHasNativeCoin(chainId)) return;
  if (Object.keys(pot.tokens).some(tokenAddress => isVoteTokenOfPot(chainId, tokenAddress))) return;
  throw new Error(`the rewards pot on chain ${chainId} was read without its vote token`);
}

export const assertPotAcceptsNativeCoin = (chainId: number | undefined): void =>
  assertChainHasNativeCoin(chainId, "a rewards pool");
