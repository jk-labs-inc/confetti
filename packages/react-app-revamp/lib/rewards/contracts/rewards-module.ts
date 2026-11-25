import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import { readContract } from "@wagmi/core";
import { chainHasNativeCoin } from "lib/voteCurrency";
import { Abi, Address, formatUnits } from "viem";
import { fetchTokenAddresses } from "../database";
import { assertPotIncludesVoteToken } from "../pot";
import { TokenData, TotalRewardsData, TotalRewardsQuery } from "../types";
import { findRewardTokensChainName, readRewardsTotals } from "./reads";

function fetchRewardTokenAddresses(rewardsModuleAddress: Address, chainId: number): Promise<Address[]> {
  const chainName = findRewardTokensChainName(chainId);
  if (!chainName) {
    console.warn(`Chain with ID ${chainId} not found, using only native rewards`);
    return Promise.resolve([]);
  }
  return fetchTokenAddresses(rewardsModuleAddress, chainName);
}

export async function fetchTotalRewards(query: TotalRewardsQuery): Promise<TotalRewardsData> {
  const tokenAddressesLookup = fetchRewardTokenAddresses(query.rewardsModuleAddress, query.chainId);
  const { totals } = await readRewardsTotals(getWagmiConfig(), query, tokenAddressesLookup);
  assertPotIncludesVoteToken(query.chainId, totals);

  return totals;
}

/**
 * Fetches total rewards for a specific ranking in a rewards module
 * @param rewardsModuleAddress address of the rewards module
 * @param rewardsModuleAbi ABI of the rewards module
 * @param chainId chain ID
 * @param ranking the ranking to fetch rewards for
 * @returns total rewards data for the specific ranking (native and erc20 tokens)
 */
export async function fetchTotalRewardsForRank({
  rewardsModuleAddress,
  rewardsModuleAbi,
  chainId,
  ranking,
}: {
  rewardsModuleAddress: Address;
  rewardsModuleAbi: Abi;
  chainId: number;
  ranking: number;
}): Promise<TotalRewardsData> {
  try {
    const totalRewards = await fetchTotalRewards({
      rewardsModuleAddress,
      rewardsModuleAbi,
      chainId,
    });

    const [rankShareResult, totalSharesResult] = await Promise.all([
      readContract(getWagmiConfig(), {
        address: rewardsModuleAddress,
        abi: rewardsModuleAbi,
        functionName: "shares",
        chainId,
        args: [BigInt(ranking)],
      }),
      readContract(getWagmiConfig(), {
        address: rewardsModuleAddress,
        abi: rewardsModuleAbi,
        functionName: "totalShares",
        chainId,
        args: [],
      }),
    ]);

    const rankShare = rankShareResult as bigint;
    const totalShares = totalSharesResult as bigint;

    if (rankShare === 0n || totalShares === 0n) {
      return {
        native: {
          value: 0n,
          formatted: "0",
          symbol: totalRewards.native.symbol,
          decimals: totalRewards.native.decimals,
        },
        tokens: {},
      };
    }

    const nativeRankReward = (totalRewards.native.value * rankShare) / totalShares;

    const rankTokensData: Record<string, TokenData> = {};

    for (const [tokenAddress, tokenData] of Object.entries(totalRewards.tokens)) {
      const tokenRankReward = (tokenData.value * rankShare) / totalShares;
      rankTokensData[tokenAddress] = {
        value: tokenRankReward,
        formatted: formatUnits(tokenRankReward, tokenData.decimals),
        symbol: tokenData.symbol,
        decimals: tokenData.decimals,
      };
    }

    return {
      native: {
        value: nativeRankReward,
        formatted: formatUnits(nativeRankReward, totalRewards.native.decimals),
        symbol: totalRewards.native.symbol,
        decimals: totalRewards.native.decimals,
      },
      tokens: rankTokensData,
    };
  } catch (error) {
    console.error("Error fetching rewards for ranking:", error);

    if (!chainHasNativeCoin(chainId)) throw error;

    return {
      native: {
        value: 0n,
        formatted: "0",
        symbol: "ETH",
        decimals: 18,
      },
      tokens: {},
    };
  }
}
