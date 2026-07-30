import { useFundPoolStore } from "@components/_pages/Create/sections/Rewards/components/FundPool/store";
import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { orchestrateRewardsDeployment } from "@hooks/useDeployContest/deployment/process/orchestrator";
import { useDeployContestStore } from "@hooks/useDeployContest/store";
import { useError } from "@hooks/useError";
import useRewardsModule from "@hooks/useRewards";
import { switchChain } from "@wagmi/core";
import { useState } from "react";
import { useWallet } from "@hooks/useWallet";
import { useShallow } from "zustand/shallow";

export const useDeployRewards = () => {
  const {
    userAddress,
    chain: { id: chainId },
  } = useWallet();
  const contestConfig = useContestConfigStore(state => state.contestConfig);
  const {
    rewardPoolData,
    addFundsToRewards,
    deploymentProcess,
    setDeploymentPhase,
    setTransactionState,
    setFundTokenTransaction,
    setRewardsModuleAddress,
    resetStore,
  } = useDeployContestStore(
    useShallow(state => ({
      rewardPoolData: state.rewardPoolData,
      addFundsToRewards: state.addFundsToRewards,
      deploymentProcess: state.deploymentProcess,
      setDeploymentPhase: state.setDeploymentPhase,
      setTransactionState: state.setTransactionState,
      setFundTokenTransaction: state.setFundTokenTransaction,
      setRewardsModuleAddress: state.setRewardsModuleAddress,
      resetStore: state.resetStore,
    })),
  );
  const { tokenWidgets, resetFundPool } = useFundPoolStore(
    useShallow(state => ({
      tokenWidgets: state.tokenWidgets,
      resetFundPool: state.reset,
    })),
  );
  const [isDeploying, setIsDeploying] = useState(false);
  const { refetch: refetchRewardsModule } = useRewardsModule();
  const isConnectedOnCorrectChain = chainId === contestConfig.chainId;
  const { handleError } = useError();

  const deployRewards = async () => {
    if (!userAddress || !contestConfig.address || !contestConfig.chainId) {
      return;
    }

    if (!isConnectedOnCorrectChain) {
      await switchChain(getWagmiConfig(), { chainId: contestConfig.chainId });
    }

    setIsDeploying(true);

    try {
      await orchestrateRewardsDeployment({
        contestAddress: contestConfig.address,
        chainId: contestConfig.chainId,
        userAddress: userAddress,
        rewardPoolData,
        tokenWidgets,
        addFundsToRewards,
        onPhaseChange: setDeploymentPhase,
        onTransactionUpdate: setTransactionState,
        onFundTokenUpdate: setFundTokenTransaction,
        onRewardsModuleAddress: setRewardsModuleAddress,
        onCriticalPhaseComplete: async () => {
          setIsDeploying(false);
          refetchRewardsModule();
          resetStore();
          resetFundPool();
        },
      });
    } catch (error) {
      handleError(error, "Rewards deployment failed");
      setIsDeploying(false);
      resetStore();
      resetFundPool();
      throw error;
    }
  };

  return {
    deployRewards,
    isDeploying,
    deploymentProcess,
    addFundsToRewards,
  };
};
