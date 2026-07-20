import { addUserActionForAnalytics } from "lib/analytics/participants";
import { updateRewardAnalytics } from "lib/analytics/rewards";
import { Charge } from "@hooks/useDeployContest/types";
import { formatEther } from "viem";

interface UserAnalyticsParams {
  contestAddress: string;
  userAddress: `0x${string}` | undefined;
  chainName: string;
  pickedProposal: string | null;
  pickedProposalName?: string;
  amountOfVotes: number;
  costToVote: bigint | undefined;
  charge: Charge;
}

interface RewardsAnalyticsParams {
  address: string;
  rewardsModuleAddress: string;
  charge: Charge;
  chainName: string;
  costToVote: bigint | undefined;
  operation: "deposit" | "withdraw";
  token_address: string | null;
}

export interface CombinedAnalyticsParams extends UserAnalyticsParams, RewardsAnalyticsParams {}

const formatChargeAmount = (amount: number): number => {
  return Number(formatEther(BigInt(amount)));
};

export const addUserActionAnalytics = async (params: UserAnalyticsParams) => {
  try {
    await addUserActionForAnalytics({
      contest_address: params.contestAddress,
      user_address: params.userAddress,
      network_name: params.chainName,
      proposal_id: params.pickedProposal !== null ? params.pickedProposal : undefined,
      proposal_name: params.pickedProposalName,
      vote_amount: params.amountOfVotes,
      created_at: Math.floor(Date.now() / 1000),
      amount_sent: params.costToVote ? formatChargeAmount(parseFloat(params.costToVote.toString())) : null,
      percentage_to_rewards: params.charge.percentageToRewards,
    });
  } catch (error) {
    console.error("Error in addUserActionForAnalytics:", error);
  }
};

export const updateRewardAnalyticsIfNeeded = async (
  params: RewardsAnalyticsParams,
  refetchTotalRewards: () => void,
) => {
  try {
    await updateRewardAnalytics({
      contest_address: params.address,
      rewards_module_address: params.rewardsModuleAddress,
      network_name: params.chainName,
      amount:
        formatChargeAmount(parseFloat(params.costToVote?.toString() ?? "0")) *
        (params.charge.percentageToRewards / 100),
      operation: "deposit",
      token_address: null,
      created_at: Math.floor(Date.now() / 1000),
    });
  } catch (error) {
    console.error("Error while updating reward analytics", error);
  }
  refetchTotalRewards();
};

export const performAnalytics = async (params: CombinedAnalyticsParams, refetchTotalRewards: () => void) => {
  try {
    await addUserActionAnalytics(params);
    await updateRewardAnalyticsIfNeeded(params, refetchTotalRewards);
  } catch (error) {
    console.error("Error in performAnalytics:", error);
  }
};
