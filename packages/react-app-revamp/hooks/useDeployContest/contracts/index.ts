import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import getContestContractVersion from "@helpers/getContestContractVersion";
import { readContract } from "@wagmi/core";
import { Abi } from "viem";

export async function isSortingEnabled(address: string, chainId: number) {
  try {
    const { abi } = await getContestContractVersion(address as `0x${string}`, chainId);

    if (!abi) {
      console.error("ABI not found");
      return false;
    }

    const contractConfig = {
      address: address as `0x${string}`,
      abi: abi as Abi,
      chainId: chainId,
    };

    const result = (await readContract(getWagmiConfig(), {
      ...contractConfig,
      functionName: "sortingEnabled",
    })) as number;

    return Number(result) === 1;
  } catch (error) {
    console.error("error in isSortingEnabled:", error);
    return false;
  }
}
