import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import { chains } from "@config/wagmi";
import getContestContractVersion from "@helpers/getContestContractVersion";
import { ContestStateEnum } from "@hooks/useContestState/store";
import { readContract, readContracts } from "@wagmi/core";
import { getRewardsModuleInfo } from "lib/rewards/contracts";
import { fetchTotalRewards } from "lib/rewards/contracts/rewards-module";
import { ContestWithTotalRewards, ProcessedContest } from "./types";

export const EMPTY_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000";
export const EMPTY_ADDRESS = "0x0000000000000000000000000000000000000000";

/**
 * Get contract config for a given address and chainId
 * @param address Contract address
 * @param chainId Chain ID
 * @returns Contract config
 */
async function getContractConfig(address: string, chainId: number) {
  const { abi } = await getContestContractVersion(address, chainId);

  if (abi === null) {
    return;
  }

  const contractConfig = {
    address: address as `0x${string}`,
    abi: abi as any,
    chainId: chainId,
  };

  return contractConfig;
}

/**
 * Get contest title and state in a single batch of contract calls
 * @param contestAddress Contract address
 * @param networkName Network name
 * @returns Object containing title and isCanceled status
 */
export async function getContestContractData(
  contestAddress: string,
  networkName: string,
): Promise<{ title: string | null; isCanceled: boolean; prompt: string | null }> {
  const chainId = chains.find(c => c.name.toLowerCase() === networkName.toLowerCase())?.id;
  if (!chainId) return { title: null, isCanceled: false, prompt: null };

  try {
    const contractConfig = await getContractConfig(contestAddress, chainId);
    if (!contractConfig) {
      return { title: null, isCanceled: false, prompt: null };
    }

    const results = await readContracts(getWagmiConfig(), {
      contracts: [
        {
          ...contractConfig,
          functionName: "name",
          args: [],
        },
        {
          ...contractConfig,
          functionName: "state",
          args: [],
        },
        {
          ...contractConfig,
          functionName: "prompt",
          args: [],
        },
      ],
    });

    const title = results[0].result as string;
    const state = results[1].result;
    const prompt = results[2].result as string;
    const isCanceled = state === ContestStateEnum.Canceled;

    return { title, isCanceled, prompt };
  } catch (error) {
    console.error("Error fetching contest data:", error);
    return { title: null, isCanceled: false, prompt: null };
  }
}

/**
 * Fetches total rewards for multiple contests using the fetchTotalRewards function
 * @param contests Array of contests with address and network_name
 * @returns Array of contests with their total rewards data
 */
export async function fetchTotalRewardsForContests(contests: ProcessedContest[]): Promise<ContestWithTotalRewards[]> {
  const results = await Promise.allSettled(
    contests.map(async (contest): Promise<ContestWithTotalRewards> => {
      try {
        if (!contest.address || !contest.network_name) {
          return {
            contestAddress: contest.address || "unknown",
            chain: contest.network_name || "unknown",
            hasRewards: false,
            rewardsData: null,
          };
        }

        const contestAddress = contest.address;
        const contestChainName = contest.network_name;

        const chain = chains.find(
          c => c.name.replace(/\s+/g, "").toLowerCase() === contestChainName.replace(/\s+/g, "").toLowerCase(),
        );

        if (!chain) {
          console.warn(`Chain not found for ${contestChainName}`);
          return {
            contestAddress,
            chain: contestChainName,
            hasRewards: false,
            rewardsData: null,
          };
        }

        // Get contract config and check if it has rewards module
        const contractConfig = await getContractConfig(contestAddress, chain.id);
        if (
          !contractConfig ||
          !contractConfig.abi?.some((el: { name: string }) => el.name === "officialRewardsModule")
        ) {
          return {
            contestAddress,
            chain: contestChainName,
            hasRewards: false,
            rewardsData: null,
          };
        }

        const rewardsModuleAddress = (await readContract(getWagmiConfig(), {
          ...contractConfig,
          functionName: "officialRewardsModule",
          args: [],
        })) as string;

        if (!rewardsModuleAddress || rewardsModuleAddress === EMPTY_ADDRESS || rewardsModuleAddress === EMPTY_HASH) {
          return {
            contestAddress,
            chain: contestChainName,
            hasRewards: false,
            rewardsData: null,
          };
        }

        const { abi: rewardsModuleAbi } = await getRewardsModuleInfo(rewardsModuleAddress, chain.id);
        if (!rewardsModuleAbi) {
          return {
            contestAddress,
            chain: contestChainName,
            hasRewards: false,
            rewardsData: null,
          };
        }

        const rewardsData = await fetchTotalRewards({
          rewardsModuleAddress: rewardsModuleAddress as `0x${string}`,
          rewardsModuleAbi,
          chainId: chain.id,
        });

        const hasNativeRewards = rewardsData.native.value > 0n;
        const hasTokenRewards = Object.values(rewardsData.tokens).some(token => token.value > 0n);

        return {
          contestAddress,
          chain: contestChainName,
          hasRewards: hasNativeRewards || hasTokenRewards,
          rewardsData,
        };
      } catch (error) {
        console.error(`Error fetching rewards for contest ${contest.address}:`, error);
        return {
          contestAddress: contest.address || "unknown",
          chain: contest.network_name || "unknown",
          hasRewards: false,
          rewardsData: null,
        };
      }
    }),
  );

  // Extract the values from Promise.allSettled results
  return results.map(result => {
    if (result.status === "fulfilled") {
      return result.value;
    } else {
      console.error("Failed to process contest:", result.reason);
      return {
        contestAddress: "unknown",
        chain: "unknown",
        hasRewards: false,
        rewardsData: null,
      };
    }
  });
}
