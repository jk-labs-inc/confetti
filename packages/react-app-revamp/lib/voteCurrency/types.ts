import { ChainVoteToken } from "@config/wagmi/custom-chains/types";
import { Abi } from "viem";

export interface NativeVoteCurrency {
  kind: "native";
  symbol: string;
  decimals: 18;
}

export type TokenVoteCurrency = ChainVoteToken & { kind: "token" };

export type VoteCurrency = NativeVoteCurrency | TokenVoteCurrency;

export type ChargedUnits = bigint & { readonly __unit: "charged" };

export interface VotePayment {
  value: bigint | undefined;
  wasApproved: boolean;
}

export interface VoteCostAuthorization {
  voteCurrency: VoteCurrency;
  contest: `0x${string}`;
  chainId: number;
  voter: `0x${string}`;
  cost: bigint;
  onApprovalNeeded?: () => Promise<void>;
}

export interface VotePotSource {
  native: { value: bigint };
  tokens: Record<string, { value: bigint }>;
}

export interface ContestVoteCurrencyLookup {
  address: `0x${string}`;
  abi: Abi;
  chainId: number;
  version: string;
}
