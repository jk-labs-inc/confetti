import { ChainVoteCastsData, recoverUnrecordedCasts } from "@hooks/useChainVoteCasts";
import { ContestVoteEvent } from "lib/analytics/participants/getContestVoteEvents";
import { compareCastsAscending } from "lib/analytics/participants/getContestVoteLedger";
import {
  ContestVoteLedger,
  ContestVoteLedgerData,
  EntryTally,
  EntryVoterTally,
  VoterEntryTally,
  VoterTally,
} from "./types";

const foldedByData = new WeakMap<ContestVoteLedgerData, ContestVoteLedger>();
const mergedByRecorded = new WeakMap<ContestVoteLedgerData, WeakMap<ChainVoteCastsData, ContestVoteLedgerData>>();

const compareVoterEntriesByVotesDesc = (a: VoterEntryTally, b: VoterEntryTally): number =>
  b.votes - a.votes || b.lastCastAt - a.lastCastAt || a.proposalId.localeCompare(b.proposalId);

const compareEntryVotersByVotesDesc = (a: EntryVoterTally, b: EntryVoterTally): number =>
  compareVoterEntriesByVotesDesc(a, b) || a.address.localeCompare(b.address);

const newVoterTally = (address: string, firstEntryId: string): VoterTally => ({
  address,
  totalVotes: 0,
  totalSpent: 0,
  lastCastAt: 0,
  entries: new Map(),
  highestVotedEntryId: firstEntryId,
});

const newVoterEntryTally = (proposalId: string): VoterEntryTally => ({
  proposalId,
  votes: 0,
  spent: 0,
  castCount: 0,
  lastCastAt: 0,
});

const newEntryTally = (proposalId: string): EntryTally => ({
  proposalId,
  ledgerVotes: 0,
  voterCount: 0,
  lastCastAt: 0,
  votersByVotesDesc: [],
});

function foldLedger({ casts, isTruncated }: ContestVoteLedgerData): ContestVoteLedger {
  const byVoter = new Map<string, VoterTally>();

  for (const cast of casts) {
    const address = cast.userAddress.toLowerCase();
    const spent = cast.amountSent ?? 0;

    let voter = byVoter.get(address);
    if (!voter) {
      voter = newVoterTally(address, cast.proposalId);
      byVoter.set(address, voter);
    }
    voter.totalVotes += cast.voteAmount;
    voter.totalSpent += spent;
    voter.lastCastAt = Math.max(voter.lastCastAt, cast.createdAt);

    let entry = voter.entries.get(cast.proposalId);
    if (!entry) {
      entry = newVoterEntryTally(cast.proposalId);
      voter.entries.set(cast.proposalId, entry);
    }
    entry.votes += cast.voteAmount;
    entry.spent += spent;
    entry.castCount += 1;
    entry.lastCastAt = Math.max(entry.lastCastAt, cast.createdAt);
  }

  const byEntry = new Map<string, EntryTally>();

  for (const voter of byVoter.values()) {
    let highest: VoterEntryTally | null = null;

    for (const entry of voter.entries.values()) {
      if (!highest || compareVoterEntriesByVotesDesc(entry, highest) < 0) highest = entry;

      let tally = byEntry.get(entry.proposalId);
      if (!tally) {
        tally = newEntryTally(entry.proposalId);
        byEntry.set(entry.proposalId, tally);
      }
      tally.ledgerVotes += entry.votes;
      tally.lastCastAt = Math.max(tally.lastCastAt, entry.lastCastAt);
      if (entry.votes > 0) tally.voterCount += 1;
      tally.votersByVotesDesc.push({ ...entry, address: voter.address });
    }

    if (highest) voter.highestVotedEntryId = highest.proposalId;
  }

  for (const tally of byEntry.values()) tally.votersByVotesDesc.sort(compareEntryVotersByVotesDesc);

  return { casts, byVoter, byEntry, isTruncated };
}

export function foldLedgerCached(data: ContestVoteLedgerData): ContestVoteLedger {
  const cached = foldedByData.get(data);
  if (cached) return cached;
  const folded = foldLedger(data);
  foldedByData.set(data, folded);
  return folded;
}

export function mergeCasts(
  prev: ContestVoteLedgerData | undefined,
  incoming: ContestVoteEvent[],
): ContestVoteLedgerData | undefined {
  if (!prev) return undefined;

  const known = new Set(prev.casts.map(cast => cast.uuid));
  const fresh = new Map<string, ContestVoteEvent>();
  for (const cast of incoming) {
    if (!known.has(cast.uuid)) fresh.set(cast.uuid, cast);
  }
  if (fresh.size === 0) return prev;

  return {
    casts: [...prev.casts, ...fresh.values()].sort(compareCastsAscending),
    isTruncated: prev.isTruncated,
  };
}

export function mergeChainCasts(recorded: ContestVoteLedgerData, chainData: ChainVoteCastsData): ContestVoteLedgerData {
  let mergedByChain = mergedByRecorded.get(recorded);
  const cached = mergedByChain?.get(chainData);
  if (cached) return cached;

  const recovered = recoverUnrecordedCasts(chainData, recorded.casts);
  const merged =
    recovered.length > 0
      ? { ...recorded, casts: [...recorded.casts, ...recovered].sort(compareCastsAscending) }
      : recorded;

  if (!mergedByChain) {
    mergedByChain = new WeakMap();
    mergedByRecorded.set(recorded, mergedByChain);
  }
  mergedByChain.set(chainData, merged);
  return merged;
}
