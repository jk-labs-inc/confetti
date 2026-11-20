import { Config, readContract } from "@wagmi/core";
import { VoteQuoteOutdatedError } from "utils/error/voteQuote";
import { Abi } from "viem";

interface QuotedContest {
  address: `0x${string}`;
  abi: Abi;
  chainId: number;
}

export async function assertVoteQuoteStillHolds(
  config: Config,
  contest: QuotedContest,
  quotedPricePerVote: bigint,
): Promise<void> {
  const currentPricePerVote = await readContract(config, { ...contest, functionName: "currentPricePerVote" });

  if (currentPricePerVote !== quotedPricePerVote) throw new VoteQuoteOutdatedError();
}
