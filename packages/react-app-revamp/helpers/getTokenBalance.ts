import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import { readContract } from "@wagmi/core";
import { erc20Abi } from "viem";

export interface GetTokenBalanceParams {
  tokenAddress: `0x${string}`;
  userAddress: `0x${string}`;
  chainId: number;
}

export interface TokenBalance {
  value: bigint;
  decimals: number;
}

/**
 * Gets the balance of an ERC20 token for a specific address
 */
export const getTokenBalance = async ({
  tokenAddress,
  userAddress,
  chainId,
}: GetTokenBalanceParams): Promise<TokenBalance> => {
  const [value, decimals] = await Promise.all([
    readContract(getWagmiConfig(), {
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [userAddress],
      chainId,
    }),
    readContract(getWagmiConfig(), {
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "decimals",
      chainId,
    }),
  ]);

  return {
    value,
    decimals,
  };
};
