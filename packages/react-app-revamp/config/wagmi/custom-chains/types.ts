import { Address, Chain } from "viem";

export interface ChainVoteToken {
  address: Address;
  symbol: string;
  decimals: 6;
  usdPegged: true;
  approveAndVoteGasLimit: number;
}

export type ChainWithIcon = Chain & {
  iconUrl?: string;
  voteToken?: ChainVoteToken;
  transactionGasCap?: bigint;
  isContestDescriptionOptional?: boolean;
  feeToken?: never;
};
