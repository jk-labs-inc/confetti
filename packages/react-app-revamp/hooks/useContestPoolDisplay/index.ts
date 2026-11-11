import { useCancelRewards } from "@hooks/useCancelRewards";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { ContestStatus, useContestStatusStore } from "@hooks/useContestStatus/store";
import { toRewardTokenItems } from "@hooks/useCurrency/useTotalRewardsUsd";
import useRewardsModule from "@hooks/useRewards";
import { useTotalRewards } from "@hooks/useTotalRewards";
import { ModuleType, RewardsPhase } from "lib/rewards/types";
import { useMemo } from "react";
import { Abi } from "viem";
import { useShallow } from "zustand/shallow";
import { ContestPoolDisplay } from "./types";

const PHASE_BY_CONTEST_STATUS: Record<ContestStatus, RewardsPhase> = {
  [ContestStatus.ContestOpen]: "upcoming",
  [ContestStatus.SubmissionOpen]: "upcoming",
  [ContestStatus.VotingOpen]: "live",
  [ContestStatus.VotingClosed]: "ended",
};

export const useContestPoolDisplay = (): ContestPoolDisplay => {
  const { chainId, chainName, version } = useContestConfigStore(
    useShallow(state => ({
      chainId: state.contestConfig.chainId,
      chainName: state.contestConfig.chainName,
      version: state.contestConfig.version,
    })),
  );
  const contestStatus = useContestStatusStore(state => state.contestStatus);
  const { data: rewards, isLoading: isRewardsLoading, isSuccess: isRewardsSuccess, isError } = useRewardsModule();
  const {
    isCanceled,
    isLoading: isCancelLoading,
    isError: isCancelError,
  } = useCancelRewards({
    rewardsAddress: rewards?.contractAddress as `0x${string}`,
    abi: rewards?.abi as Abi,
    chainId,
    version,
  });
  const hasValidModule =
    isRewardsSuccess && !!rewards && !rewards.isBytecodeInvalid && !isCanceled && !isError && !isCancelError;

  const {
    data: totalRewards,
    isLoading: isTotalRewardsLoading,
    isError: isTotalRewardsError,
  } = useTotalRewards({
    rewardsModuleAddress: rewards?.contractAddress as `0x${string}`,
    rewardsModuleAbi: rewards?.abi as Abi,
    chainId,
    enabled: hasValidModule,
  });

  const tokenItems = useMemo(() => toRewardTokenItems(totalRewards), [totalRewards]);

  if (isRewardsLoading || isCancelLoading || (hasValidModule && isTotalRewardsLoading)) return { status: "loading" };
  if (!hasValidModule || !rewards || isTotalRewardsError || tokenItems.length === 0) return { status: "empty" };

  return {
    status: "ready",
    tokenItems,
    chainName,
    phase: PHASE_BY_CONTEST_STATUS[contestStatus],
    audience: rewards.moduleType === ModuleType.VOTER_REWARDS ? "voters" : "entrants",
  };
};

export default useContestPoolDisplay;
