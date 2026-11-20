import { Distribution } from "@components/_pages/Contest/Rewards/types";
import { RewardsParams } from "@hooks/useUserRewards";
import {
  createERC20TokenRead,
  createNativeTokenReadBatch,
  fetchReleasableRewards,
  prepareRewardsFetching,
} from "./contracts";
import { nativePotRankings } from "./pot";
import { addRewardToDistribution, processReleasableRewards } from "./utils";

/**
 * Fetches claimed (released) rewards
 */
export async function fetchClaimedRewards({
  contractAddress,
  chainId,
  abi,
  userAddress,
  rankings,
  creatorAddress,
  contestChainName,
  nativeTokenInfo,
  version,
}: RewardsParams & {
  contestChainName: string;
  nativeTokenInfo: { symbol: string; decimals: number };
}): Promise<Distribution[]> {
  const { validRankings, tiedRankings, tokenAddresses, tokenInfo } = await prepareRewardsFetching({
    contractAddress,
    chainId,
    abi,
    userAddress,
    rankings,
    contestChainName,
    version,
    creatorAddress,
  });

  const distributionsMap = new Map<number, Distribution>();
  const isCreator = creatorAddress && userAddress === creatorAddress;

  // Process valid rankings
  if (validRankings.length > 0) {
    const nativeRankings = nativePotRankings(chainId, validRankings);
    const nativeReleasedResults = await createNativeTokenReadBatch(
      contractAddress,
      chainId,
      abi,
      nativeRankings,
      userAddress,
      "releasedToVoter",
    );

    for (let i = 0; i < nativeRankings.length; i++) {
      const ranking = nativeRankings[i];
      const nativeAmount = nativeReleasedResults[i]?.result as bigint | undefined;

      addRewardToDistribution(
        distributionsMap,
        ranking,
        nativeAmount || 0n,
        "native",
        nativeTokenInfo.symbol,
        nativeTokenInfo.decimals,
      );
    }

    // fetch and process ERC20 released rewards if we have token addresses
    if (tokenAddresses.length > 0) {
      for (const ranking of validRankings) {
        for (const tokenAddress of tokenAddresses) {
          const erc20ReleasedResult = await createERC20TokenRead(
            contractAddress,
            chainId,
            abi,
            tokenAddress,
            ranking,
            userAddress,
            "erc20ReleasedToVoter",
          );

          const amount = erc20ReleasedResult[0]?.result as bigint | undefined;

          addRewardToDistribution(
            distributionsMap,
            ranking,
            amount || 0n,
            tokenAddress,
            tokenInfo.symbols?.[tokenAddress] || "unknown",
            tokenInfo.decimals?.[tokenAddress] || 18,
          );
        }
      }
    }
  }

  // Process tied rankings if user is the creator
  if (isCreator && tiedRankings.length > 0) {
    // For tied rankings, we use "released" instead of "releasedToVoter" for the creator
    const nativeTiedRankings = nativePotRankings(chainId, tiedRankings);
    const nativeReleasedResults = await createNativeTokenReadBatch(
      contractAddress,
      chainId,
      abi,
      nativeTiedRankings,
      userAddress,
      "released", // Use released for creator
      true,
    );

    for (let i = 0; i < nativeTiedRankings.length; i++) {
      const ranking = nativeTiedRankings[i];
      const nativeAmount = nativeReleasedResults[i]?.result as bigint | undefined;

      addRewardToDistribution(
        distributionsMap,
        ranking,
        nativeAmount || 0n,
        "native",
        nativeTokenInfo.symbol,
        nativeTokenInfo.decimals,
      );
    }

    // fetch and process ERC20 released rewards for tied rankings if we have token addresses
    if (tokenAddresses.length > 0) {
      for (const ranking of tiedRankings) {
        for (const tokenAddress of tokenAddresses) {
          const erc20ReleasedResult = await createERC20TokenRead(
            contractAddress,
            chainId,
            abi,
            tokenAddress,
            ranking,
            userAddress,
            "erc20Released", // Use erc20Released for creator
            true,
          );

          const amount = erc20ReleasedResult[0]?.result as bigint | undefined;

          addRewardToDistribution(
            distributionsMap,
            ranking,
            amount || 0n,
            tokenAddress,
            tokenInfo.symbols?.[tokenAddress] || "unknown",
            tokenInfo.decimals?.[tokenAddress] || 18,
          );
        }
      }
    }
  }

  return Array.from(distributionsMap.values());
}

/**
 * Fetches claimable rewards
 */
export async function fetchClaimableRewards({
  contractAddress,
  chainId,
  abi,
  userAddress,
  rankings,
  creatorAddress,
  version,
  contestChainName,
  nativeTokenInfo,
}: RewardsParams & {
  contestChainName: string;
  nativeTokenInfo: { symbol: string; decimals: number };
}): Promise<Distribution[]> {
  const { validRankings, tiedRankings, tokenAddresses, tokenInfo } = await prepareRewardsFetching({
    contractAddress,
    chainId,
    abi,
    userAddress,
    rankings,
    contestChainName,
    version,
  });

  const distributionsMap = new Map<number, Distribution>();
  const isCreator = creatorAddress && userAddress === creatorAddress;

  if (validRankings.length > 0) {
    const rewardResults = await fetchReleasableRewards(
      validRankings,
      tokenAddresses,
      contractAddress,
      chainId,
      abi,
      userAddress,
    );

    processReleasableRewards(
      rewardResults,
      nativeTokenInfo,
      tokenInfo.symbols || {},
      tokenInfo.decimals || {},
      distributionsMap,
    );
  }

  // Process tied rankings if user is the creator
  if (isCreator && tiedRankings.length > 0) {
    // For tied rankings, we use "releasable" instead of "releasableToVoter" for the creator
    const tiedRewardResults = await fetchReleasableRewards(
      tiedRankings,
      tokenAddresses,
      contractAddress,
      chainId,
      abi,
      userAddress,
      true,
    );

    processReleasableRewards(
      tiedRewardResults,
      nativeTokenInfo,
      tokenInfo.symbols || {},
      tokenInfo.decimals || {},
      distributionsMap,
    );
  }

  return Array.from(distributionsMap.values());
}
