import { DeploymentPhase, TransactionState } from "../../types";
import { attachRewardsModule, deployRewardsModule, fundPoolTokens } from "./operations";
import { RewardPoolData } from "../../slices/contestCreateRewards";
import { FundPoolToken } from "@components/_pages/Create/sections/Rewards/components/FundPool/store";
import { WALLET_RPC_SYNC_CHAIN_IDS, WALLET_RPC_SYNC_DELAY_MS } from "./constants";

interface DeployRewardsParams {
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
}

export const deployRewardsPool = async (params: DeployRewardsParams): Promise<void> => {
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
  } = params;

  onPhaseChange("deploying-rewards");

  const rewardsModuleAddress = await deployRewardsModule({
    contestAddress,
    chainId,
    userAddress,
    rewardPoolData,
    onStatusUpdate: (status, hash, error) => {
      onTransactionUpdate("deployRewards", { status, hash, error });
    },
  });

  onRewardsModuleAddress(rewardsModuleAddress);

  if (WALLET_RPC_SYNC_CHAIN_IDS.has(chainId)) {
    await new Promise(resolve => setTimeout(resolve, WALLET_RPC_SYNC_DELAY_MS));
  }

  onPhaseChange("attaching-rewards");

  await attachRewardsModule({
    contestAddress,
    chainId,
    rewardsModuleAddress,
    onStatusUpdate: (status, hash, error) => {
      onTransactionUpdate("attachRewards", { status, hash, error });
    },
  });

  if (addFundsToRewards && tokenWidgets.some(token => parseFloat(token.amount) > 0)) {
    onPhaseChange("funding-pool");

    await fundPoolTokens({
      contestAddress,
      chainId,
      rewardsModuleAddress,
      tokenWidgets,
      onTokenStatusUpdate: (tokenKey, status, hash, error) => {
        onFundTokenUpdate(tokenKey, { status, hash, error });
      },
    });
  }

  onPhaseChange("completed");
};
