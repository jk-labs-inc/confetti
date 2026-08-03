import type { MappedProposalIds } from "@hooks/useProposal/store";
import { parseEther } from "viem";
import { EntryStanding, VoteProjectionMode } from "./types";

/**
 * whole votes a native-unit spend buys, floored wei-exactly so the lib, the displayed
 * vote count, and the cast tx always agree (float division floors 0.3/0.1 down to 2).
 */
export const votesFromSpend = (spendNative: string, pricePerVoteNative: string): number => {
  try {
    const spendWei = parseEther(spendNative);
    const priceWei = parseEther(pricePerVoteNative);
    if (spendWei <= 0n || priceWei <= 0n) return 0;
    return Number(spendWei / priceWei);
  } catch {
    return 0;
  }
};

/**
 * standing of an entry against its best rival, from the live proposal vote map.
 * null when the entry is missing — legacy contests never populate the map, so it
 * callers must degrade to hidden rather than compute against an empty field.
 */
export const getEntryStanding = (mapped: MappedProposalIds[], entryId: string): EntryStanding | null => {
  let entryVotes: number | null = null;
  let maxOtherVotes = 0;

  for (const { id, votes } of mapped) {
    const rounded = Math.round(votes);
    if (id === entryId) {
      entryVotes = rounded;
    } else if (rounded > maxOtherVotes) {
      maxOtherVotes = rounded;
    }
  }

  if (entryVotes === null) return null;

  return { entryVotes, maxOtherVotes };
};

/** rank-1 share of the pool as 0-100. `payees` order isn't guaranteed, so look rank 1 up. */
export const firstPlaceSharePercentage = (payees: number[], payeeShares: number[], totalShares: number): number => {
  if (totalShares <= 0) return 0;
  const firstPlaceIndex = payees.indexOf(1);
  if (firstPlaceIndex === -1) return 0;
  return ((payeeShares[firstPlaceIndex] ?? 0) / totalShares) * 100;
};

/** which projection the current input puts the entry in; ties at the top count as not-first. */
export const resolveProjectionMode = (
  standing: EntryStanding,
  newVotes: number,
): VoteProjectionMode.PushToFirst | VoteProjectionMode.WouldWinNow => {
  return standing.entryVotes + newVotes > standing.maxOtherVotes
    ? VoteProjectionMode.WouldWinNow
    : VoteProjectionMode.PushToFirst;
};
