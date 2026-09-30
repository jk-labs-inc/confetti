import { shareOfTotal } from "@helpers/percentages";
import { VoterEntryTally, VoterTally } from "@hooks/useContestVoteLedger/types";
import { MappedProposalIds } from "@hooks/useProposal/store";
import { rankProposals } from "@hooks/useProposal/utils";
import BigNumber from "bignumber.js";
import { ModuleType, RewardModuleInfo } from "lib/rewards/types";
import { parseEther } from "viem";
import { EarningsContext, EntryRank, EntryRanking } from "./types";

const NATIVE_DECIMALS = 18;
const NO_TIED_RANK = Number.POSITIVE_INFINITY;

export const hasVoterPayouts = (rewards: RewardModuleInfo | null | undefined): rewards is RewardModuleInfo =>
  !!rewards &&
  !rewards.isBytecodeInvalid &&
  rewards.moduleType === ModuleType.VOTER_REWARDS &&
  rewards.payees.length > 0 &&
  rewards.totalShares > 0;

export function rankEntries(mapped: MappedProposalIds[]): EntryRanking {
  const ranked = rankProposals(
    mapped.map(entry => ({ id: entry.id, netVotes: entry.votes })),
    mapped,
  );

  const byId = new Map<string, EntryRank>();
  let firstTiedRank = NO_TIED_RANK;

  for (const proposal of ranked) {
    byId.set(proposal.id, { rank: proposal.rank, votes: proposal.netVotes, isTied: proposal.isTied });
    if (proposal.isTied && proposal.rank > 0 && proposal.rank < firstTiedRank) firstTiedRank = proposal.rank;
  }

  return { byId, firstTiedRank };
}

const isPayableRank = (rank: number, firstTiedRank: number, payees: number[]): boolean =>
  rank > 0 && rank < firstTiedRank && payees.includes(rank);

export const payableRankSet = (payees: number[], firstTiedRank: number): Set<number> =>
  new Set(payees.filter(rank => isPayableRank(rank, firstTiedRank, payees)));

export const nativeToWei = (value: number): bigint => {
  if (!Number.isFinite(value) || value <= 0) return 0n;
  return parseEther(new BigNumber(value).toFixed(NATIVE_DECIMALS, BigNumber.ROUND_DOWN));
};

const rankShareFraction = (rank: number, earnings: EarningsContext): number => {
  if (!earnings.payableRanks.has(rank) || earnings.totalShares <= 0) return 0;
  return (earnings.payeeShares[earnings.payees.indexOf(rank)] ?? 0) / earnings.totalShares;
};

const estimateEntryEarning = (
  votesOnEntry: number,
  entryTotalVotes: number,
  entryRank: number,
  earnings: EarningsContext,
): number => {
  if (votesOnEntry <= 0 || entryTotalVotes <= 0) return 0;
  return shareOfTotal(votesOnEntry, entryTotalVotes) * rankShareFraction(entryRank, earnings) * earnings.poolNative;
};

export function estimateVoterEarning(
  entries: Iterable<VoterEntryTally>,
  entryRanking: EntryRanking,
  entryVotesById: Map<string, number>,
  earnings: EarningsContext,
): number {
  let total = 0;
  for (const entry of entries) {
    total += estimateEntryEarning(
      entry.votes,
      entryVotesById.get(entry.proposalId) ?? 0,
      entryRanking.byId.get(entry.proposalId)?.rank ?? 0,
      earnings,
    );
  }
  return total;
}

export function pickMainEntryId(
  voter: VoterTally,
  entryRanking: EntryRanking,
  entryVotesById: Map<string, number>,
  earnings: EarningsContext | null,
): string {
  if (!earnings) return voter.highestVotedEntryId;

  let bestId = voter.highestVotedEntryId;
  let bestEarning = 0;
  for (const entry of voter.entries.values()) {
    const earning = estimateEntryEarning(
      entry.votes,
      entryVotesById.get(entry.proposalId) ?? 0,
      entryRanking.byId.get(entry.proposalId)?.rank ?? 0,
      earnings,
    );
    if (earning > bestEarning) {
      bestEarning = earning;
      bestId = entry.proposalId;
    }
  }
  return bestId;
}
