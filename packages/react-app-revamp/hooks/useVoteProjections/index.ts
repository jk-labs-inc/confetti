import { toFixedString } from "@helpers/formatBalance";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { useContestPricingData } from "@hooks/useContestPricingData";
import { useFetchUserVotesOnProposal } from "@hooks/useFetchUserVotesOnProposal";
import { useProposalStore } from "@hooks/useProposal/store";
import useRewardsModule from "@hooks/useRewards";
import { useTotalRewards } from "@hooks/useTotalRewards";
import {
  VoteProjectionMode,
  calculatePushToFirst,
  calculateWinUpTo,
  calculateWouldWinNow,
  firstPlaceSharePercentage,
  getEntryStanding,
  resolveProjectionMode,
  validateWinUpToData,
  votesFromSpend,
} from "lib/voteProjections";
import { Abi, Address } from "viem";
import { useShallow } from "zustand/shallow";

interface UseVoteProjectionsParams {
  proposalId: string | null;
  spendNative: string;
  pricePerVoteNative: string;
  submissionsCount: number;
}

export type EntryProjection =
  | { kind: "pushToFirst"; remainingToFirst: string }
  | { kind: "wouldWinNow"; amount: string; isBelowSpend: boolean };

export interface UseVoteProjectionsReturn {
  isLoading: boolean;
  votes: number;
  entryProjection: EntryProjection | null;
  pushToFirstFillAmount: string | null;
  winUpTo: {
    amount: string;
    shouldShow: boolean;
  };
}

export const useVoteProjections = ({
  proposalId,
  spendNative,
  pricePerVoteNative,
  submissionsCount,
}: UseVoteProjectionsParams): UseVoteProjectionsReturn => {
  const contestConfig = useContestConfigStore(useShallow(state => state.contestConfig));
  const initialMappedProposalIds = useProposalStore(useShallow(state => state.initialMappedProposalIds));

  const {
    data: rewards,
    isLoading: isRewardsLoading,
    isSuccess: isRewardsSuccess,
    isError: isRewardsError,
  } = useRewardsModule();
  const pricing = useContestPricingData();

  const rewardsReady = isRewardsSuccess && !!rewards && !rewards.isBytecodeInvalid && rewards.isSelfFunded;

  const { data: totalRewards, isLoading: isPoolLoading } = useTotalRewards({
    rewardsModuleAddress: rewards?.contractAddress as Address | undefined,
    rewardsModuleAbi: rewards?.abi as Abi | undefined,
    chainId: contestConfig.chainId,
    enabled: rewardsReady,
  });

  const { currentUserVotesOnProposal } = useFetchUserVotesOnProposal(contestConfig.address, proposalId ?? "");
  const myExistingVotes = Math.max(0, currentUserVotesOnProposal.data ?? 0);

  const isLoading = isRewardsLoading || pricing.isLoading || (rewardsReady && isPoolLoading);

  const firstShare = rewards
    ? firstPlaceSharePercentage(rewards.payees ?? [], rewards.payeeShares ?? [], rewards.totalShares ?? 0)
    : 0;

  const projectionsAvailable =
    !isLoading &&
    !isRewardsError &&
    !pricing.isError &&
    rewardsReady &&
    submissionsCount > 0 &&
    validateWinUpToData(pricing.percentageToRewards, firstShare, pricing.costToVote);

  const votes = votesFromSpend(spendNative, pricePerVoteNative);

  // empty input projects the placeholder spend (one vote's worth) into win-up-to and
  // would-win-now, so the resting numbers match typing the placeholder; push-to-1st stays raw
  const projectedVotes = spendNative ? votes : votesFromSpend(pricePerVoteNative, pricePerVoteNative);
  const winUpToAmount = projectionsAvailable
    ? calculateWinUpTo({
        newVotes: projectedVotes,
        costToVoteAtStart: pricing.costToVote,
        multiple: pricing.multiple,
        percentageToRewards: pricing.percentageToRewards,
        firstPlaceSharePercentage: firstShare,
        submissionsCount,
        priceCurveType: pricing.priceCurveType,
      })
    : 0;

  const price = parseFloat(pricePerVoteNative);
  const standing =
    projectionsAvailable && proposalId && price > 0 ? getEntryStanding(initialMappedProposalIds, proposalId) : null;

  let entryProjection: EntryProjection | null = null;
  let pushToFirstFillAmount: string | null = null;

  if (standing) {
    const pushToFirstResult = calculatePushToFirst({ ...standing, newVotes: votes, pricePerVoteNative });
    pushToFirstFillAmount = pushToFirstResult?.fillAmount ?? null;

    if (resolveProjectionMode(standing, votes) === VoteProjectionMode.PushToFirst && pushToFirstResult) {
      entryProjection = {
        kind: "pushToFirst",
        remainingToFirst: toFixedString(pushToFirstResult.remainingToFirst),
      };
    } else {
      const result = calculateWouldWinNow({
        myExistingVotes,
        entryVotes: standing.entryVotes,
        newVotes: projectedVotes,
        pricePerVote: price,
        currentPoolNative: Number(totalRewards?.native.formatted ?? "0"),
        percentageToRewards: pricing.percentageToRewards,
        firstPlaceSharePercentage: firstShare,
      });
      entryProjection = {
        kind: "wouldWinNow",
        amount: toFixedString(result.amount),
        isBelowSpend: result.isBelowSpend,
      };
    }
  }

  return {
    isLoading,
    votes,
    entryProjection,
    pushToFirstFillAmount,
    winUpTo: { amount: toFixedString(winUpToAmount), shouldShow: projectionsAvailable },
  };
};

export default useVoteProjections;
