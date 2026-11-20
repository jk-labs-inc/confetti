import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import { readContracts } from "@wagmi/core";
import { Abi } from "viem";

/**
 * Creates a contract read batch for native token data
 */
export const createNativeTokenReadBatch = async (
  contractAddress: `0x${string}`,
  chainId: number,
  abi: Abi,
  validRankings: number[],
  userAddress: `0x${string}`,
  functionName: string,
  isCreator?: boolean,
) => {
  if (validRankings.length === 0) return [];

  try {
    return await readContracts(getWagmiConfig(), {
      contracts: validRankings.map(ranking => ({
        address: contractAddress,
        chainId,
        abi,
        functionName,
        args: isCreator ? [BigInt(ranking)] : [userAddress, BigInt(ranking)],
      })),
    });
  } catch (error) {
    console.error("Error in createNativeTokenReadBatch:", error);
    return [];
  }
};

/**
 * Creates a contract read for ERC20 token data
 */
export const createERC20TokenRead = async (
  contractAddress: `0x${string}`,
  chainId: number,
  abi: Abi,
  tokenAddress: `0x${string}`,
  ranking: number,
  userAddress: `0x${string}`,
  functionName: string,
  isCreator?: boolean,
) => {
  try {
    return await readContracts(getWagmiConfig(), {
      contracts: [
        {
          address: contractAddress,
          chainId,
          abi,
          functionName,
          args: isCreator ? [tokenAddress, BigInt(ranking)] : [tokenAddress, userAddress, BigInt(ranking)],
        },
      ],
    });
  } catch (error) {
    console.error("Error in createERC20TokenRead:", error);
    return [];
  }
};
