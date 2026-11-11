import { isSupabaseConfigured } from "@helpers/database";
import { getJson, postJson } from "@helpers/fetchJson";
import type { OfficialModuleInsert, RewardTokensQuery } from "lib/supabase/types";

/**
 * Fetches the list of all ERC20 token addresses associated with a specific rewards module address.
 * This function retrieves unique token addresses from the analytics_rewards_v3 table in the database,
 * filtering by the given rewards module address and network name.
 *
 * @param rewardsModuleAddress address of the rewards module
 * @param networkName name of the chain
 * @returns a Promise that resolves to an array of unique ERC20 token addresses
 */
export const getTokenAddresses = async (rewardsModuleAddress: string, networkName: string): Promise<string[]> => {
  if (!isSupabaseConfigured) return [];

  const query: RewardTokensQuery = { rewardsModule: rewardsModuleAddress, chain: networkName };
  return getJson<string[]>("/api/rewards", query);
};

/**
 * Inserts a contest with voting rewards into the database.
 * @param contestAddress contest address
 * @param chainName chain name
 * @returns true if the contest was inserted successfully, false otherwise
 */
export const insertContestWithOfficialModule = async (contestAddress: string, chainName: string): Promise<boolean> => {
  if (!isSupabaseConfigured) return false;

  try {
    const row: OfficialModuleInsert = { address: contestAddress, network_name: chainName };
    await postJson("/api/contests/official-module", row);
    return true;
  } catch (error) {
    console.error("Failed to insert contest with official module:", error);
    return false;
  }
};

/**
 * Fetches token addresses for a contract
 * @param contractAddress the rewards module contract address
 * @param contestChainName the chain name
 * @returns array of token addresses
 */
export const fetchTokenAddresses = async (
  contractAddress: `0x${string}`,
  contestChainName: string,
): Promise<`0x${string}`[]> => {
  try {
    return (await getTokenAddresses(contractAddress, contestChainName)) as `0x${string}`[];
  } catch (error) {
    console.error("Failed to fetch token addresses:", error);
    return [];
  }
};
