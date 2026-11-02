import type { TransactionOverlaySuccessMeta } from "@components/UI/TransactionOverlay/types";
import type { Hash } from "viem";

export interface CastVotesOptions {
  pricePerVoteRaw: bigint;
  feedback: "silent";
  onSent: (hash: Hash) => void;
}

export interface CastVotesResult {
  hash: Hash;
  amountOfVotes: number;
  successMeta: TransactionOverlaySuccessMeta;
}
