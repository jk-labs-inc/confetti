import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import { chains } from "@config/wagmi";
import getContestContractVersion from "@helpers/getContestContractVersion";
import { ContestStateEnum } from "@hooks/useContestState/store";
import { readContracts } from "@wagmi/core";
import { fetchVerifiedTotalRewards, getRewardsModuleAddress } from "lib/rewards/contracts";
import { Address } from "viem";
import { ContestWithTotalRewards, ProcessedContest } from "./types";

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

const withoutRewards = (contest: ProcessedContest): ContestWithTotalRewards => ({
  contestAddress: contest.address || "unknown",
  chain: contest.network_name || "unknown",
  hasRewards: false,
  rewardsData: null,
});

const normalizeChainName = (chainName: string) => chainName.replace(/\s+/g, "").toLowerCase();

export async function fetchTotalRewardsForContest(contest: ProcessedContest): Promise<ContestWithTotalRewards> {
  try {
    if (!contest.address || !contest.network_name) return withoutRewards(contest);

    const contestChainName = normalizeChainName(contest.network_name);
    const chain = chains.find(c => normalizeChainName(c.name) === contestChainName);

    if (!chain) {
      console.warn(`Chain not found for ${contest.network_name}`);
      return withoutRewards(contest);
    }

    const contractConfig = await getContractConfig(contest.address, chain.id);
    if (!contractConfig) return withoutRewards(contest);

    const rewardsModuleAddress = await getRewardsModuleAddress(contractConfig);
    if (!rewardsModuleAddress) return withoutRewards(contest);

    const rewardsData = await fetchVerifiedTotalRewards(rewardsModuleAddress as Address, chain.id);
    if (!rewardsData) return withoutRewards(contest);

    return {
      contestAddress: contest.address,
      chain: contest.network_name,
      hasRewards: true,
      rewardsData,
    };
  } catch (error) {
    console.error(`Error fetching rewards for contest ${contest.address}:`, error);
    return withoutRewards(contest);
  }
}

/**
 * Fetches total rewards for multiple contests
 * @param contests Array of contests with address and network_name
 * @returns Array of contests with their total rewards data
 */
export function fetchTotalRewardsForContests(contests: ProcessedContest[]): Promise<ContestWithTotalRewards[]> {
  return Promise.all(contests.map(fetchTotalRewardsForContest));
}
