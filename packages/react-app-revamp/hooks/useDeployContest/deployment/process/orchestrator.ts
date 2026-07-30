import { DeploymentPhase, TransactionState } from "../../types";
import { deployRewardsPool } from "../rewards";
import { RewardPoolData } from "../../slices/contestCreateRewards";
import { FundPoolToken } from "@components/_pages/Create/sections/Rewards/components/FundPool/store";
import { insertContestWithOfficialModule } from "lib/rewards/database";
import { getChainFromId } from "@helpers/getChainFromId";

interface OrchestrateRewardsDeploymentParams {
  contestAddress: string;
  chainId: number;
  userAddress: `0x${string}`;
  rewardPoolData: RewardPoolData;
  tokenWidgets: FundPoolToken[];
  addFundsToRewards: boolean;
  onPhaseChange: (phase: DeploymentPhase) => void;
  onTransactionUpdate: (transaction: "deployRewards" | "attachRewards", state: TransactionState) => void;
  onFundTokenUpdate: (tokenKey: string, state: TransactionState) => void;
  onRewardsModuleAddress: (address: string) => void;
  onCriticalPhaseComplete: () => void;
}

export const orchestrateRewardsDeployment = async (params: OrchestrateRewardsDeploymentParams): Promise<void> => {
  const {
    contestAddress,
    chainId,
    userAddress,
    rewardPoolData,
    tokenWidgets,
    addFundsToRewards,
    onPhaseChange,
    onTransactionUpdate,
    onFundTokenUpdate,
    onRewardsModuleAddress,
    onCriticalPhaseComplete,
  } = params;

  try {
    await deployRewardsPool({
      contestAddress,
      chainId,
      userAddress,
      rewardPoolData,
      tokenWidgets,
      addFundsToRewards,
      onPhaseChange,
      onTransactionUpdate,
      onFundTokenUpdate,
      onRewardsModuleAddress,
    });

    const chainName = getChainFromId(chainId)?.name.toLowerCase();
    try {
      await insertContestWithOfficialModule(contestAddress, chainName ?? "");
    } catch (error) {
      console.error("Failed to insert contest with official module:", error);
    }
  } catch (error) {
    console.error("Rewards deployment failed:", error);
    onPhaseChange("failed");
  } finally {
    onCriticalPhaseComplete();
  }
};
