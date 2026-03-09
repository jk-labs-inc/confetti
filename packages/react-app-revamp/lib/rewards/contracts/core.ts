import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import getVoterRewardsModuleContractVersion from "@helpers/getVoterRewardsModuleContractVersion";
import { verifyContractBytecode } from "@helpers/verifyContractBytecode";
import { ContractConfig } from "@hooks/useContest";
import { readContract } from "@wagmi/core";
import { compareVersions } from "compare-versions";
import { Abi } from "viem";
import { ModuleType, RewardsModuleInfo, VOTER_REWARDS_VERSION } from "../types";

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
  try {
    const { abi, version, deployedBytecode } = await getVoterRewardsModuleContractVersion(
      rewardsModuleAddress,
      chainId,
    );

    if (!abi || !deployedBytecode) return EMPTY_REWARDS_MODULE_INFO;

    const isBytecodeValid = await verifyContractBytecode(rewardsModuleAddress, chainId, deployedBytecode);

    if (!isBytecodeValid) return { abi: null, moduleType: null, isBytecodeInvalid: true };

    const isLegacyVersion = compareVersions(version, VOTER_REWARDS_VERSION) < 0;
    const moduleType = isLegacyVersion
      ? ModuleType.AUTHOR_REWARDS
      : await getModuleType(rewardsModuleAddress, abi as Abi, chainId);

    return {
      abi: abi as Abi,
      moduleType: moduleType as ModuleType,
    };
  } catch (error) {
    console.error("Error in getRewardsModuleInfo:", error);
    return EMPTY_REWARDS_MODULE_INFO;
  }
}

/**
 * Gets the rewards module address for a contest
 * @param contractConfig contest contract config
 * @returns rewards module address
 */
export async function getRewardsModuleAddress(contractConfig: ContractConfig): Promise<string | null> {
  try {
    const hasRewardsModule = contractConfig.abi?.some((el: { name: string }) => el.name === "officialRewardsModule");

    if (!hasRewardsModule) return null;

    const address = (await readContract(getWagmiConfig(), {
      ...contractConfig,
      functionName: "officialRewardsModule",
      args: [],
    })) as string;

    return address === "0x0000000000000000000000000000000000000000" ? null : address;
  } catch (error) {
    console.error("Error getting rewards module address:", error);
    return null;
  }
}

/**
 * Gets the module type
 * @param address address of the rewards module
 * @param abi ABI of the rewards module
 * @param chainId chain ID
 * @returns module type
 */
export async function getModuleType(address: string, abi: Abi, chainId: number): Promise<string> {
  try {
    return (await readContract(getWagmiConfig(), {
      address: address as `0x${string}`,
      abi,
      functionName: "MODULE_TYPE",
      chainId,
      args: [],
    })) as string;
  } catch (error) {
    console.error("Error getting module type:", error);
    return "UNKNOWN";
  }
}
