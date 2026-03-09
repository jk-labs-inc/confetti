import { Abi } from "viem";

export type ContractQuery = {
  address: `0x${string}`;
  chainId: number;
  abi: Abi;
  functionName: string;
  args: any[];
};

export interface RewardToken {
  tokenAddress: string;
  balance: number;
}

export interface RewardsModuleInfo {
  abi: Abi | null;
  moduleType: ModuleType | null;
  isBytecodeInvalid?: boolean;
}

export enum ModuleType {
  VOTER_REWARDS = "VOTER_REWARDS",
  AUTHOR_REWARDS = "AUTHOR_REWARDS",
}

export interface TokenData {
  value: bigint;
  formatted: string;
  symbol: string;
  decimals: number;
}

export interface TotalRewardsData {
  native: TokenData;
  tokens: Record<string, TokenData>;
}

export interface RankShare {
  rank: number;
  share: bigint;
}

export interface RewardModuleInfo {
  abi: Abi;
  moduleType: ModuleType;
  contractAddress: string;
  creator: string;
  payees: number[];
  payeeShares: number[];
  totalShares: number;
  blockExplorers?: string;
  isSelfFunded: boolean;
  isBytecodeInvalid?: boolean;
}

export const VOTER_REWARDS_VERSION = "5.5";
