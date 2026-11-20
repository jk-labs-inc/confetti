import { Config, readContract } from "@wagmi/core";
import { toPriceUnits, VoteCurrency } from "lib/voteCurrency";
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
  voteCurrency: VoteCurrency,
  quotedPricePerVote: bigint,
): Promise<void> {
  const currentPricePerVote = await readContract(config, { ...contest, functionName: "currentPricePerVote" });

  if (toPriceUnits(voteCurrency, currentPricePerVote as bigint) !== quotedPricePerVote) {
    throw new VoteQuoteOutdatedError();
  }
}
