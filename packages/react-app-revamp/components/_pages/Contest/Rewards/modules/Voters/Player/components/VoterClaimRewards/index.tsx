import { Reward } from "@components/_pages/Contest/Rewards/types";
import Loader from "@components/UI/Loader";
import { useClaimRewards } from "@hooks/useClaimRewards";
import { useContestStore } from "@hooks/useContest/store";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { ContestStatus } from "@hooks/useContestStatus/store";
import useUserRewards from "@hooks/useUserRewards";
import { useUserTiedRankings } from "@hooks/useUserTiedRankings";
import { RewardModuleInfo } from "lib/rewards/types";
import { FC } from "react";
import { useWallet } from "@hooks/useWallet";
import { useShallow } from "zustand/shallow";
import RewardsError from "../../../../shared/Error";
import RewardsPlayerViewClaimRewards from "../../../../shared/PlayerView/ClaimRewards";
import RewardsPlayerLosingStatus from "../../../../shared/PlayerView/LosingStatus";
import RewardsPlayerTiedStatus from "../../../../shared/PlayerView/TiedStatus";

interface VoterClaimRewardsProps {
  rewards: RewardModuleInfo;
  chainId: number;
  contestStatus: ContestStatus;
  contestAddress: `0x${string}`;
  tiedRankings: number[];
}

const VoterClaimRewards: FC<VoterClaimRewardsProps> = ({
  rewards,
  chainId,
  contestStatus,
  contestAddress,
  tiedRankings,
}) => {
  const { userAddress } = useWallet();
  const contestAuthorEthereumAddress = useContestStore(useShallow(state => state.contestAuthorEthereumAddress));
  const { contestConfig } = useContestConfigStore(useShallow(state => state));
  const isCreator = userAddress === contestAuthorEthereumAddress;
  const {
    data: userTiedRankings = [],
    isLoading: isTiedRankingsLoading,
    isError: isTiedRankingsError,
  } = useUserTiedRankings({
    tiedRankings,
    contestAddress,
    chainId,
    contestAbi: contestConfig.abi,
    userAddress: userAddress as `0x${string}`,
    version: contestConfig.version,
    enabled: tiedRankings.length > 0 && !!userAddress && !isCreator,
  });

  const {
    claimable,
    claimed,
    totalRewards,
    isLoading: isUserRewardsLoading,
    refetch,
    isError: isUserRewardsError,
  } = useUserRewards({
    contractAddress: rewards.contractAddress as `0x${string}`,
    chainId,
    abi: rewards.abi,
    userAddress: userAddress as `0x${string}`,
    rankings: rewards.payees,
    creatorAddress: contestAuthorEthereumAddress as `0x${string}`,
    claimedEnabled: contestStatus === ContestStatus.VotingClosed,
    version: contestConfig.version,
  });

  const {
    claimRewards,
    isLoading: isClaimLoading,
    isSuccess: isClaimSuccess,
  } = useClaimRewards({
    contractRewardsModuleAddress: rewards.contractAddress as `0x${string}`,
    abiRewardsModule: rewards.abi,
    chainId,
    userAddress: userAddress as `0x${string}`,
  });

  const handleClaim = async (rank: number, reward: Reward) => {
    await claimRewards(rank, reward.value, reward.address, reward.decimals, userAddress);
  };

  if (isUserRewardsLoading || isTiedRankingsLoading) {
    return <Loader className="mt-8">Loading...</Loader>;
  }

  if (isUserRewardsError || isTiedRankingsError) {
    return <RewardsError onRetry={refetch} />;
  }

  if (userTiedRankings.length > 0 && !totalRewards.length) {
    return <RewardsPlayerTiedStatus phase={contestStatus === ContestStatus.VotingOpen ? "active" : "closed"} />;
  }

  if (contestStatus === ContestStatus.VotingOpen && !totalRewards.length) {
    return <RewardsPlayerLosingStatus phase="active" />;
  }

  if (contestStatus === ContestStatus.VotingClosed && !totalRewards.length) {
    return <RewardsPlayerLosingStatus phase="closed" />;
  }

  return (
    <RewardsPlayerViewClaimRewards
      totalRewards={totalRewards || []}
      claimableDistributions={claimable?.distributions || []}
      claimedDistributions={claimed?.distributions || []}
      contestStatus={contestStatus}
      tiedRankings={tiedRankings}
      isCreator={isCreator}
      onRefresh={refetch}
      onClaim={handleClaim}
      isClaimLoading={(rank: number, tokenAddress: string) => isClaimLoading(rank, tokenAddress)}
      isClaimSuccess={(rank: number, tokenAddress: string) => isClaimSuccess(rank, tokenAddress)}
      userTiedRankings={userTiedRankings}
      isAdditionalStatisticsSupported
    />
  );
};

export default VoterClaimRewards;
