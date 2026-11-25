import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import { getTokenDecimalsBatch, getTokenSymbolBatch } from "@helpers/getTokenDecimals";
import { RewardsParams } from "@hooks/useUserRewards";
import { readContracts } from "@wagmi/core";
import { Abi } from "viem";
import { fetchTokenAddresses } from "../database";
import { knownPotTokens, nativePotRankings } from "../pot";
import { ReleasableRewardRead } from "../types";
import { createERC20TokenQuery, createNativeTokenQuery } from "../utils";
import { validateRankings } from "./validation";

/**
 * Fetches releasable rewards
 * @param validRankings valid rankings
 * @param tokenAddresses token addresses
 * @param contractAddress contract address
 * @param chainId chain ID
 * @param abi ABI of the contract
 * @param userAddress user address
 * @param isCreator whether the user is the creator
 * @returns releasable rewards
 */
export async function fetchReleasableRewards(
  validRankings: number[],
  tokenAddresses: `0x${string}`[],
  contractAddress: `0x${string}`,
  chainId: number,
  abi: Abi,
  userAddress?: `0x${string}`,
  isCreator?: boolean,
): Promise<ReleasableRewardRead[]> {
  // build all native token queries
  const nativeTokenReads = nativePotRankings(chainId, validRankings).map(ranking => ({
    ranking,
    tokenAddress: undefined,
    query: createNativeTokenQuery(contractAddress, chainId, abi, ranking, userAddress, isCreator),
  }));

  // build all ERC20 token queries if we have token addresses
  const erc20Reads = validRankings.flatMap(ranking =>
    tokenAddresses.map(tokenAddress => ({
      ranking,
      tokenAddress,
      query: createERC20TokenQuery(contractAddress, chainId, abi, ranking, tokenAddress, userAddress, isCreator),
    })),
  );

  const reads = [...nativeTokenReads, ...erc20Reads];

  if (reads.length === 0) return [];

  try {
    const results = await readContracts(getWagmiConfig(), {
      contracts: reads.map(read => read.query),
    });

    return reads.map(({ ranking, tokenAddress }, readIndex) => ({
      ranking,
      tokenAddress,
      amount: results[readIndex]?.result as bigint | undefined,
    }));
  } catch (error) {
    console.error("Error fetching releasable rewards:", error);
    return [];
  }
}

/**
 * Prepares rewards fetching
 */
export const prepareRewardsFetching = async (
  params: RewardsParams & {
    contestChainName: string;
  },
) => {
  const { rankings, contractAddress, chainId, abi, contestChainName, version, creatorAddress } = params;

  if (!rankings.length) {
    return { validRankings: [], tiedRankings: [], tokenAddresses: [], tokenInfo: {} };
  }

  const tokenAddresses = await fetchTokenAddresses(contractAddress, contestChainName);
  const { validRankings, tiedRankings } = await validateRankings(
    rankings,
    contractAddress,
    chainId,
    abi,
    version,
    creatorAddress,
  );

  if (!validRankings.length && !tiedRankings.length) {
    return { validRankings: [], tiedRankings: [], tokenAddresses: [], tokenInfo: {} };
  }

  // get token symbols and decimals for ERC20 tokens (if any) in parallel
  const [symbols, decimals] =
    tokenAddresses.length > 0
      ? await Promise.all([
          getTokenSymbolBatch(tokenAddresses, chainId),
          getTokenDecimalsBatch(tokenAddresses, chainId),
        ])
      : [{}, {}];

  const knownTokens = knownPotTokens(chainId, tokenAddresses);

  return {
    validRankings,
    tiedRankings,
    tokenAddresses,
    tokenInfo: {
      symbols: { ...knownTokens.symbols, ...symbols },
      decimals: { ...knownTokens.decimals, ...decimals },
    },
  };
};
