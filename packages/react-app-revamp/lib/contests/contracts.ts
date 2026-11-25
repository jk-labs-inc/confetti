import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import { ContestStateEnum } from "@hooks/useContestState/types";
import { readContestPool } from "lib/rewards/contracts/reads";
import { fetchTokenAddresses, getTokenAddresses } from "lib/rewards/database";
import { ContestPoolRead, TotalRewardsData } from "lib/rewards/types";
import { findContestChain, readContestDetails, readContestFields, resolveContestContract } from "./reads";
import { ContestDetails, ContestRef, ContestWithTotalRewards } from "./types";

export const EMPTY_ADDRESS = "0x0000000000000000000000000000000000000000";

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
  if (!findContestChain(networkName)) return { title: null, isCanceled: false, prompt: null };

  try {
    const contract = await resolveContestContract({ address: contestAddress, network_name: networkName });
    const { title, state, prompt } = await readContestFields(getWagmiConfig(), contract);

    return { title: title as string, isCanceled: state === ContestStateEnum.Canceled, prompt: prompt as string };
  } catch (error) {
    console.error("Error fetching contest data:", error);
    return { title: null, isCanceled: false, prompt: null };
  }
}

export async function fetchContestDetails(contest: ContestRef): Promise<ContestDetails> {
  return readContestDetails(getWagmiConfig(), await resolveContestContract(contest));
}

export const withoutRewards = (contest: ContestRef): ContestWithTotalRewards => ({
  contestAddress: contest.address || "unknown",
  chain: contest.network_name || "unknown",
  hasRewards: false,
  rewardsData: null,
});

export const withRewards = (contest: ContestRef, rewardsData: TotalRewardsData): ContestWithTotalRewards => ({
  contestAddress: contest.address,
  chain: contest.network_name,
  hasRewards: true,
  rewardsData,
});

export async function fetchContestPool(contest: ContestRef): Promise<ContestPoolRead> {
  return readContestPool(getWagmiConfig(), await resolveContestContract(contest), getTokenAddresses);
}

export async function fetchTotalRewardsForContest(contest: ContestRef): Promise<ContestWithTotalRewards> {
  try {
    if (!contest.address || !contest.network_name) return withoutRewards(contest);

    if (!findContestChain(contest.network_name)) {
      console.warn(`Chain not found for ${contest.network_name}`);
      return withoutRewards(contest);
    }

    const contract = await resolveContestContract(contest);
    const pool = await readContestPool(getWagmiConfig(), contract, fetchTokenAddresses);

    return pool.status === "read" ? withRewards(contest, pool.totals) : withoutRewards(contest);
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
export function fetchTotalRewardsForContests(contests: ContestRef[]): Promise<ContestWithTotalRewards[]> {
  return Promise.all(contests.map(fetchTotalRewardsForContest));
}
