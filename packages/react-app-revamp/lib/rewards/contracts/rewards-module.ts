import { chains } from "@config/wagmi";
import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import { getTokenBalanceValue } from "@helpers/getTokenBalance";
import { getBalance, readContract, readContracts } from "@wagmi/core";
import { Abi, Address, erc20Abi, formatUnits } from "viem";
import { getTokenAddresses } from "../database";
import { ContractQuery, TokenData, TotalRewardsData } from "../types";

/**
 * Fetches total rewards for a rewards module
 * @param rewardsModuleAddress address of the rewards module
 * @param rewardsModuleAbi ABI of the rewards module
 * @param chainId chain ID
 * @returns total rewards data (native and erc20 tokens)
 */
export async function fetchTotalRewards({
  rewardsModuleAddress,
  rewardsModuleAbi,
  chainId,
}: {
  rewardsModuleAddress: Address;
  rewardsModuleAbi: Abi;
  chainId: number;
}): Promise<TotalRewardsData> {
  const nativeBalance = await getBalance(getWagmiConfig(), {
    address: rewardsModuleAddress,
    chainId,
  });

  let nativeTotalReleased = 0n;
  const tokensData: Record<string, TokenData> = {};

  try {
    const chain = chains.find(chain => chain.id === chainId);
    if (!chain) {
      console.warn(`Chain with ID ${chainId} not found, using only native rewards`);
    } else {
      const networkName = chain.name.toLowerCase();
      const tokenAddresses = (await getTokenAddresses(rewardsModuleAddress, networkName)) as Address[];

      const contractCalls: ContractQuery[] = [
        {
          address: rewardsModuleAddress,
          abi: rewardsModuleAbi,
          functionName: "totalReleased",
          chainId,
          args: [],
        },
      ];

      // add ERC20 token calls if we have token addresses
      if (tokenAddresses && tokenAddresses.length > 0) {
        tokenAddresses.forEach(tokenAddress => {
          contractCalls.push(
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
          );
        });
      }

      const contractResults = await readContracts(getWagmiConfig(), {
        contracts: contractCalls,
      });

      nativeTotalReleased = (contractResults[0].result as bigint) || 0n;
      const nativeTotal = nativeBalance.value + nativeTotalReleased;

      if (tokenAddresses && tokenAddresses.length > 0) {
        const tokenBalances = await Promise.all(
          tokenAddresses.map(tokenAddress =>
            getTokenBalanceValue({
              tokenAddress,
              userAddress: rewardsModuleAddress,
              chainId,
            }),
          ),
        );

        for (let i = 0; i < tokenAddresses.length; i++) {
          const tokenAddress = tokenAddresses[i];
          const resultBaseIndex = 1 + i * 3;

          const tokenTotalReleasedResult = contractResults[resultBaseIndex];
          const symbolResult = contractResults[resultBaseIndex + 1];
          const decimalsResult = contractResults[resultBaseIndex + 2];

          if (
            tokenTotalReleasedResult.status === "failure" ||
            symbolResult.status === "failure" ||
            decimalsResult.status === "failure"
          ) {
            const error = [tokenTotalReleasedResult, symbolResult, decimalsResult].find(
              r => r.status === "failure",
            )?.error;
            console.error(`Failed to get token data for ${tokenAddress}:`, error);
            continue;
          }

          const tokenTotalReleased = (tokenTotalReleasedResult.result as bigint) || 0n;
          const symbol = symbolResult.result as string;
          const decimals = decimalsResult.result as number;
          const tokenBalanceValue = tokenBalances[i];

          const tokenTotal = tokenBalanceValue + tokenTotalReleased;

          tokensData[tokenAddress as string] = {
            value: tokenTotal,
            formatted: formatUnits(tokenTotal, decimals),
            symbol,
            decimals,
          };
        }
      }

      return {
        native: {
          value: nativeTotal,
          formatted: formatUnits(nativeTotal, 18),
          symbol: nativeBalance.symbol || "ETH",
          decimals: 18,
        },
        tokens: tokensData,
      };
    }
  } catch (error) {
    console.error("Error fetching token data:", error);
  }

  const nativeTotal = nativeBalance.value + nativeTotalReleased;
  return {
    native: {
      value: nativeTotal,
      formatted: formatUnits(nativeTotal, 18),
      symbol: nativeBalance.symbol || "ETH",
      decimals: 18,
    },
    tokens: tokensData,
  };
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
