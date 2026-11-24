import { findChainIdByName } from "@helpers/getChainId";
import {
  findChainVoteCurrency,
  isUsdPegged,
  isVoteToken,
  TokenVoteCurrency,
  voteCurrencyUsdRate,
} from "lib/voteCurrency";
import { RewardTokenItem, TotalRewardsData, UsdRates } from "./types";

interface SumRewardsUsdArgs {
  items: RewardTokenItem[];
  nativeRates: UsdRates | undefined;
  erc20Rates: UsdRates | undefined;
}

export const toRewardTokenItems = (totalRewards: TotalRewardsData | undefined): RewardTokenItem[] => {
  const items: RewardTokenItem[] = [];
  if (totalRewards?.native && totalRewards.native.value > 0n) {
    items.push({ value: totalRewards.native.formatted, symbol: totalRewards.native.symbol });
  }
  Object.entries(totalRewards?.tokens ?? {}).forEach(([address, token]) => {
    if (token.value > 0n) items.push({ value: token.formatted, symbol: token.symbol, tokenAddress: address });
  });
  return items;
};

export const sumRewardsUsd = ({ items, nativeRates, erc20Rates }: SumRewardsUsdArgs): number | null => {
  let total = 0;
  let hasAnyRate = false;

  for (const item of items) {
    const num = parseFloat(item.value);
    if (isNaN(num) || num === 0) continue;

    const rate = item.tokenAddress
      ? erc20Rates?.[item.tokenAddress.toLowerCase()]
      : nativeRates?.[item.symbol.toLowerCase()];

    if (rate !== undefined) {
      total += num * rate;
      hasAnyRate = true;
    }
  }

  return hasAnyRate ? total : null;
};

const chainPeggedToken = (chainName: string | undefined): TokenVoteCurrency | undefined => {
  const voteCurrency = findChainVoteCurrency(findChainIdByName(chainName));
  return voteCurrency?.kind === "token" && isUsdPegged(voteCurrency) ? voteCurrency : undefined;
};

export const peggedRewardTokenAddress = (
  chainName: string | undefined,
  tokenAddress: string | undefined,
): string | undefined => {
  const peggedToken = chainPeggedToken(chainName);
  return isVoteToken(peggedToken, tokenAddress) ? peggedToken.address : undefined;
};

export const peggedTokenUsdRates = (chainName: string | undefined, tokenAddresses: readonly string[]): UsdRates => {
  const peggedToken = chainPeggedToken(chainName);
  const pegRate = voteCurrencyUsdRate(peggedToken, undefined);
  const rates: UsdRates = {};
  if (pegRate === undefined) return rates;

  for (const tokenAddress of tokenAddresses) {
    if (isVoteToken(peggedToken, tokenAddress)) rates[tokenAddress.toLowerCase()] = pegRate;
  }

  return rates;
};

export const isDollarDenominatedPot = (
  chainName: string | undefined,
  items: Pick<RewardTokenItem, "tokenAddress">[],
): boolean => {
  const peggedToken = chainPeggedToken(chainName);
  return items.length > 0 && items.every(item => isVoteToken(peggedToken, item.tokenAddress));
};
