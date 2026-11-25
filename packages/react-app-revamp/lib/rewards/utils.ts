import { Distribution, Reward } from "@components/_pages/Contest/Rewards/types";
import { Abi } from "viem";
import { ContractQuery, ReleasableRewardRead } from "./types";

/*
 * Process releasable rewards, native and ERC20
 * @param reads - The releasable reward reads, each carrying its ranking and token
 * @param nativeTokenInfo - The native token info
 * @param symbols - The ERC20 symbols
 * @param decimals - The ERC20 decimals
 * @param distributionsMap - The distributions map
 */
export function processReleasableRewards(
  reads: ReleasableRewardRead[],
  nativeTokenInfo: { symbol: string; decimals: number },
  symbols: Record<string, string>,
  decimals: Record<string, number>,
  distributionsMap: Map<number, Distribution>,
) {
  for (const { ranking, tokenAddress, amount } of reads) {
    const token = tokenAddress
      ? { address: tokenAddress, symbol: symbols[tokenAddress] || "unknown", decimals: decimals[tokenAddress] || 18 }
      : { address: "native", symbol: nativeTokenInfo.symbol, decimals: nativeTokenInfo.decimals };

    addRewardToDistribution(distributionsMap, ranking, amount || 0n, token.address, token.symbol, token.decimals);
  }
}

/**
 * Create a native token query
 * @param contractAddress - The contract address
 * @param chainId - The chain id
 * @param abi - The abi of the contract
 * @param ranking - The ranking
 * @param userAddress - The user address
 * @param isCreator - The is creator (creator mode)
 * @returns The contract query
 */
export function createNativeTokenQuery(
  contractAddress: `0x${string}`,
  chainId: number,
  abi: Abi,
  ranking: number,
  userAddress?: `0x${string}`,
  isCreator?: boolean,
): ContractQuery {
  if (isCreator) {
    return {
      address: contractAddress,
      chainId,
      abi,
      functionName: "releasable",
      args: [BigInt(ranking)],
    };
  }

  return {
    address: contractAddress,
    chainId,
    abi,
    functionName: "releasableToVoter",
    args: [userAddress, BigInt(ranking)],
  };
}

/**
 * Create a ERC20 token query
 * @param contractAddress - The contract address
 * @param chainId - The chain id
 * @param abi - The abi of the contract
 * @param ranking - The ranking
 * @param tokenAddress - The token address
 * @param userAddress - The user address
 * @param isCreator - The is creator
 * (creator mode)
 * @returns The contract query
 */
export function createERC20TokenQuery(
  contractAddress: `0x${string}`,
  chainId: number,
  abi: Abi,
  ranking: number,
  tokenAddress: `0x${string}`,
  userAddress?: `0x${string}`,
  isCreator?: boolean,
): ContractQuery {
  if (isCreator) {
    return {
      address: contractAddress,
      chainId,
      abi,
      functionName: "releasable",
      args: [tokenAddress, BigInt(ranking)],
    };
  }

  return {
    address: contractAddress,
    chainId,
    abi,
    functionName: "releasableToVoter",
    args: [tokenAddress, userAddress, BigInt(ranking)],
  };
}

/*
  Add a reward to the distribution map
  @param distributionsMap - The distributions map
  @param ranking - The ranking
  @param amount - The amount
  @param address - The address
  @param decimals - The decimals
*/
export function addRewardToDistribution(
  distributionsMap: Map<number, Distribution>,
  ranking: number,
  amount: bigint,
  address: string,
  symbol: string,
  decimals: number,
) {
  if (amount && amount > 0n) {
    if (!distributionsMap.has(ranking)) {
      distributionsMap.set(ranking, { rank: ranking, rewards: [] });
    }

    distributionsMap.get(ranking)!.rewards.push({
      value: amount,
      address,
      symbol,
      decimals,
    });
  }
}

/*
  Calculate total rewards from distributions
  @param distributions - The distributions
  @returns The total rewards
*/
export function calculateTotalRewards(distributions: Distribution[]): Reward[] {
  return distributions.reduce<Reward[]>((acc, distribution) => {
    for (const reward of distribution.rewards) {
      const existingRewardIndex = acc.findIndex(r => r.address === reward.address);

      if (existingRewardIndex >= 0) {
        acc[existingRewardIndex].value += reward.value;
      } else {
        acc.push({ ...reward });
      }
    }
    return acc;
  }, []);
}
