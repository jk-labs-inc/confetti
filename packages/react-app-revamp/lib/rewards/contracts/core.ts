import "client-only";
import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import { ContractConfig } from "@hooks/useContest";
import { RewardsModuleInfo } from "../types";
import { readOfficialRewardsModule, verifyRewardsModule } from "./reads";

const EMPTY_REWARDS_MODULE_INFO: RewardsModuleInfo = {
  abi: null,
  moduleType: null,
};

/**
 * Gets information about the rewards module
 * @param rewardsModuleAddress address of the rewards module
 * @param chainId chain ID
 * @returns rewards module information
 */
export async function getRewardsModuleInfo(rewardsModuleAddress: string, chainId: number): Promise<RewardsModuleInfo> {
  const verification = await verifyRewardsModule(getWagmiConfig(), rewardsModuleAddress, chainId);

  switch (verification.status) {
    case "verified":
      return { abi: verification.abi, moduleType: verification.moduleType };
    case "bytecode-invalid":
      return { abi: null, moduleType: null, isBytecodeInvalid: true };
    case "unreadable":
      return EMPTY_REWARDS_MODULE_INFO;
    default: {
      const _exhaustive: never = verification;
      return _exhaustive;
    }
  }
}

/**
 * Gets the rewards module address for a contest
 * @param contractConfig contest contract config
 * @returns rewards module address
 */
export async function getRewardsModuleAddress(contractConfig: ContractConfig): Promise<string | null> {
  try {
    return await readOfficialRewardsModule(getWagmiConfig(), contractConfig);
  } catch (error) {
    console.error("Error getting rewards module address:", error);
    return null;
  }
}
