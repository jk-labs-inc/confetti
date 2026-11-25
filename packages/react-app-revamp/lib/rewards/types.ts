import { Abi, Address } from "viem";

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

export type RewardsModuleVerification =
  | { status: "verified"; abi: Abi; moduleType: ModuleType; version: string }
  | { status: "bytecode-invalid" }
  | { status: "unreadable" };

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

export interface TotalRewardsQuery {
  rewardsModuleAddress: Address;
  rewardsModuleAbi: Abi;
  chainId: number;
}

export interface RewardsTotalsRead {
  totals: TotalRewardsData;
  isComplete: boolean;
}

export type ContestPoolRead =
  { status: "none" } | { status: "unverified" } | { status: "read"; totals: TotalRewardsData; isComplete: boolean };

export type RewardTokensLookup = (rewardsModuleAddress: Address, chainName: string) => Promise<string[]>;

export interface KnownRewardTokens {
  symbols: Record<string, string>;
  decimals: Record<string, number>;
}

export interface ReleasableRewardRead {
  ranking: number;
  tokenAddress: `0x${string}` | undefined;
  amount: bigint | undefined;
}

export interface RewardTokenItem {
  value: string;
  symbol: string;
  tokenAddress?: string;
}

export type UsdRates = Record<string, number>;

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

export type RewardsPhase = "upcoming" | "live" | "ended";

export type RewardsAudience = "voters" | "entrants";
