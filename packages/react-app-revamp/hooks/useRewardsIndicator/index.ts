import { useCancelRewards } from "@hooks/useCancelRewards";
import { useContestStore } from "@hooks/useContest/store";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { ContestStatus, useContestStatusStore } from "@hooks/useContestStatus/store";
import useRewardsModule from "@hooks/useRewards";
import useUserRewards from "@hooks/useUserRewards";
import { useWallet } from "@hooks/useWallet";
import { ModuleType } from "lib/rewards/types";
import { Abi } from "viem";
import { useShallow } from "zustand/shallow";

export function useRewardsIndicator(): boolean {
  const { userAddress } = useWallet();
  const contestConfig = useContestConfigStore(useShallow(state => state.contestConfig));
  const contestStatus = useContestStatusStore(useShallow(state => state.contestStatus));
  const contestAuthorEthereumAddress = useContestStore(useShallow(state => state.contestAuthorEthereumAddress));
  const { data: rewards } = useRewardsModule();

  const isVotingClosed = contestStatus === ContestStatus.VotingClosed;
  const isSupportedModule = !!rewards && !rewards.isBytecodeInvalid && rewards.moduleType === ModuleType.VOTER_REWARDS;

  const { isCanceled } = useCancelRewards({
    rewardsAddress: rewards?.contractAddress as `0x${string}`,
    abi: rewards?.abi as Abi,
    chainId: contestConfig.chainId,
    version: contestConfig.version,
  });

  const enabled = isSupportedModule && !isCanceled && !!userAddress && isVotingClosed;

  const { claimable } = useUserRewards({
    contractAddress: rewards?.contractAddress as `0x${string}`,
    chainId: contestConfig.chainId,
    abi: rewards?.abi as Abi,
    userAddress: userAddress as `0x${string}`,
    rankings: rewards?.payees ?? [],
    creatorAddress: contestAuthorEthereumAddress as `0x${string}`,
    version: contestConfig.version,
    claimableEnabled: enabled,
    claimedEnabled: false,
  });

  return enabled && claimable.distributions.length > 0;
}

export default useRewardsIndicator;
