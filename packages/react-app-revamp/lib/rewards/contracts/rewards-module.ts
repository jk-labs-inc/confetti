import { chains } from "@config/wagmi";
import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import { getBalance, readContract, readContracts } from "@wagmi/core";
import { Abi, Address, erc20Abi, formatUnits } from "viem";
import { fetchTokenAddresses } from "../database";
import { ContractQuery, TokenData, TotalRewardsData } from "../types";
import { getRewardsModuleInfo } from "./core";

interface TotalRewardsQuery {
  rewardsModuleAddress: Address;
  rewardsModuleAbi: Abi;
  chainId: number;
}

interface ReleasedAndTokenTotals {
  nativeTotalReleased: bigint;
  tokens: Record<string, TokenData>;
}

const NO_RELEASED_OR_TOKEN_TOTALS: ReleasedAndTokenTotals = { nativeTotalReleased: 0n, tokens: {} };
const TOKEN_CALLS_PER_ADDRESS = 4;

function fetchRewardTokenAddresses(rewardsModuleAddress: Address, chainId: number): Promise<Address[]> {
  const chain = chains.find(chain => chain.id === chainId);
  if (!chain) {
    console.warn(`Chain with ID ${chainId} not found, using only native rewards`);
    return Promise.resolve([]);
  }
  return fetchTokenAddresses(rewardsModuleAddress, chain.name.toLowerCase());
}

async function fetchReleasedAndTokenTotals(
  { rewardsModuleAddress, rewardsModuleAbi, chainId }: TotalRewardsQuery,
  tokenAddressesLookup: Promise<Address[]>,
): Promise<ReleasedAndTokenTotals> {
  try {
    const tokenAddresses = await tokenAddressesLookup;

    const contractCalls: ContractQuery[] = [
      {
        address: rewardsModuleAddress,
        abi: rewardsModuleAbi,
        functionName: "totalReleased",
        chainId,
        args: [],
      },
      ...tokenAddresses.flatMap((tokenAddress): ContractQuery[] => [
        {
          address: rewardsModuleAddress,
          abi: rewardsModuleAbi,
          functionName: "erc20TotalReleased",
          chainId,
          args: [tokenAddress],
        },
        {
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "symbol",
          chainId,
          args: [],
        },
        {
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "decimals",
          chainId,
          args: [],
        },
        {
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "balanceOf",
          chainId,
          args: [rewardsModuleAddress],
        },
      ]),
    ];

    const contractResults = await readContracts(getWagmiConfig(), { contracts: contractCalls });

    const nativeTotalReleased = (contractResults[0].result as bigint) || 0n;
    const tokens: Record<string, TokenData> = {};

    tokenAddresses.forEach((tokenAddress, index) => {
      const resultBaseIndex = 1 + index * TOKEN_CALLS_PER_ADDRESS;
      const tokenResults = contractResults.slice(resultBaseIndex, resultBaseIndex + TOKEN_CALLS_PER_ADDRESS);
      const [tokenTotalReleasedResult, symbolResult, decimalsResult, balanceResult] = tokenResults;

      const failedResult = tokenResults.find(result => result.status === "failure");
      if (failedResult) {
        console.error(`Failed to get token data for ${tokenAddress}:`, failedResult.error);
        return;
      }

      const tokenTotalReleased = (tokenTotalReleasedResult.result as bigint) || 0n;
      const decimals = decimalsResult.result as number;
      const tokenTotal = ((balanceResult.result as bigint) || 0n) + tokenTotalReleased;

      tokens[tokenAddress] = {
        value: tokenTotal,
        formatted: formatUnits(tokenTotal, decimals),
        symbol: symbolResult.result as string,
        decimals,
      };
    });

    return { nativeTotalReleased, tokens };
  } catch (error) {
    console.error("Error fetching token data:", error);
    return NO_RELEASED_OR_TOKEN_TOTALS;
  }
}

async function sumTotalRewards(
  query: TotalRewardsQuery,
  tokenAddressesLookup: Promise<Address[]>,
): Promise<TotalRewardsData> {
  const [nativeBalance, { nativeTotalReleased, tokens }] = await Promise.all([
    getBalance(getWagmiConfig(), { address: query.rewardsModuleAddress, chainId: query.chainId }),
    fetchReleasedAndTokenTotals(query, tokenAddressesLookup),
  ]);

  const nativeTotal = nativeBalance.value + nativeTotalReleased;

  return {
    native: {
      value: nativeTotal,
      formatted: formatUnits(nativeTotal, 18),
      symbol: nativeBalance.symbol || "ETH",
      decimals: 18,
    },
    tokens,
  };
}

export function fetchTotalRewards(query: TotalRewardsQuery): Promise<TotalRewardsData> {
  return sumTotalRewards(query, fetchRewardTokenAddresses(query.rewardsModuleAddress, query.chainId));
}

export async function fetchVerifiedTotalRewards(
  rewardsModuleAddress: Address,
  chainId: number,
): Promise<TotalRewardsData | null> {
  const tokenAddressesLookup = fetchRewardTokenAddresses(rewardsModuleAddress, chainId);
  const { abi: rewardsModuleAbi } = await getRewardsModuleInfo(rewardsModuleAddress, chainId);
  if (!rewardsModuleAbi) return null;

  return sumTotalRewards({ rewardsModuleAddress, rewardsModuleAbi, chainId }, tokenAddressesLookup);
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
