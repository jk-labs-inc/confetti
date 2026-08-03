import { WouldWinNowParams, WouldWinNowResult } from "./types";

/**
 * payout if the contest ended right now — the earnings-tab formula:
 * (my % of votes on entry) × (rank-1 share) × (current pool + pool's cut of my spend).
 * assumes the entry finishes 1st, so only call it in that mode.
 */
export const calculateWouldWinNow = ({
  myExistingVotes,
  entryVotes,
  newVotes,
  pricePerVote,
  currentPoolNative,
  percentageToRewards,
  firstPlaceSharePercentage,
}: WouldWinNowParams): WouldWinNowResult => {
  const chargedSpend = newVotes * pricePerVote;

  const myVotesAfter = Math.max(0, myExistingVotes) + newVotes;
  const entryVotesAfter = entryVotes + newVotes;

  if (entryVotesAfter <= 0 || myVotesAfter <= 0) {
    return { amount: 0, chargedSpend, isBelowSpend: false };
  }

  const poolAfter = currentPoolNative + (percentageToRewards / 100) * chargedSpend;
  const amount = (myVotesAfter / entryVotesAfter) * (firstPlaceSharePercentage / 100) * poolAfter;

  return {
    amount,
    chargedSpend,
    isBelowSpend: chargedSpend > 0 && amount < chargedSpend,
  };
};
