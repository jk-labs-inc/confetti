import { toFixedString } from "@helpers/formatBalance";
import type { EntryProjection, UseVoteProjectionsReturn } from "@hooks/useVoteProjections";
import type { DemoScript, DemoVoteScenario } from "lib/howItWorks/demo";
import {
  VoteProjectionMode,
  calculatePushToFirst,
  calculateWinUpTo,
  calculateWouldWinNow,
  getEntryStanding,
  resolveProjectionMode,
  votesFromSpend,
} from "lib/voteProjections";
import { parseEther } from "viem";

export const projectDemoVote = (
  script: DemoScript,
  scenario: DemoVoteScenario,
  spendNative: string,
): UseVoteProjectionsReturn => {
  const { contest } = script;
  const { pricePerVote } = scenario;
  const votes = votesFromSpend(spendNative, pricePerVote);
  const projectedVotes = spendNative ? votes : votesFromSpend(pricePerVote, pricePerVote);
  const winUpToAmount = calculateWinUpTo({
    newVotes: projectedVotes,
    costToVoteAtStart: parseEther(contest.startPrice),
    multiple: contest.multiple,
    percentageToRewards: contest.percentageToRewards,
    firstPlaceSharePercentage: contest.firstPlaceSharePercentage,
    submissionsCount: script.entries.length,
    priceCurveType: contest.priceCurveType,
  });

  const price = parseFloat(pricePerVote);
  const standing = getEntryStanding(
    script.entries.map(entry => ({ id: entry.id, votes: entry.votes })),
    scenario.entryId,
  );

  let entryProjection: EntryProjection | null = null;
  let pushToFirstFillAmount: string | null = null;

  if (standing) {
    const pushToFirstResult = calculatePushToFirst({ ...standing, newVotes: votes, pricePerVoteNative: pricePerVote });
    pushToFirstFillAmount = pushToFirstResult?.fillAmount ?? null;

    if (resolveProjectionMode(standing, votes) === VoteProjectionMode.PushToFirst && pushToFirstResult) {
      entryProjection = { kind: "pushToFirst", remainingToFirst: toFixedString(pushToFirstResult.remainingToFirst) };
    } else {
      const result = calculateWouldWinNow({
        myExistingVotes: 0,
        entryVotes: standing.entryVotes,
        newVotes: projectedVotes,
        pricePerVote: price,
        currentPoolNative: scenario.currentPool,
        percentageToRewards: contest.percentageToRewards,
        firstPlaceSharePercentage: contest.firstPlaceSharePercentage,
      });
      entryProjection = {
        kind: "wouldWinNow",
        amount: toFixedString(result.amount),
        isBelowSpend: result.isBelowSpend,
      };
    }
  }

  return {
    isLoading: false,
    votes,
    entryProjection,
    pushToFirstFillAmount,
    winUpTo: { amount: toFixedString(winUpToAmount), shouldShow: true },
  };
};
