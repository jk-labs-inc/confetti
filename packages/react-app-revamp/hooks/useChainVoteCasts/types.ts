import { VoteCurrency } from "lib/voteCurrency";
import { Abi } from "viem";

export interface ScannedContest {
  address: `0x${string}`;
  abi: Abi;
  chainId: number;
  voteCurrency: VoteCurrency;
}

export interface ChainVoteLog {
  voter: string;
  proposalId: string;
  votes: number;
  blockNumber: bigint;
  logIndex: number;
  txHash: `0x${string}`;
  blockTimestamp: number | null;
}

export interface ChainCastDetails {
  createdAt: number;
  amountSent: number | null;
}

export interface ChainVoteCastsData {
  logs: ChainVoteLog[];
  detailsByTx: Map<string, ChainCastDetails>;
  scanFromSec: bigint;
  scannedToBlock: bigint;
  recordedCutoffSec: number;
  isComplete: boolean;
}
