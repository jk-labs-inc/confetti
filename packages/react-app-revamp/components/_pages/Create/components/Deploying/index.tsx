import { toastDismiss } from "@components/UI/Toast";
import { useDeployContestStore } from "@hooks/useDeployContest/store";
import { canNavigateToContest } from "@hooks/useDeployContest/types";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useShallow } from "zustand/shallow";
import { DeploymentStatus } from "../DeploymentStatus";

const CreateContestDeploying = () => {
  const router = useRouter();
  const { deployContestData, deploymentProcess, addFundsToRewards, resetStore, isSuccess } = useDeployContestStore(
    useShallow(state => ({
      deployContestData: state.deployContestData,
      deploymentProcess: state.deploymentProcess,
      addFundsToRewards: state.addFundsToRewards,
      resetStore: state.resetStore,
      isSuccess: state.isSuccess,
    })),
  );
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (isSuccess) {
        resetStore();
      }
    };
  }, [resetStore, isSuccess]);

  useEffect(() => {
    const shouldNavigate = canNavigateToContest(deploymentProcess, addFundsToRewards);
    const hasContestData = deployContestData && deployContestData.address;

    if (shouldNavigate && hasContestData && !hasNavigatedRef.current) {
      hasNavigatedRef.current = true;

      const contestPath = `/contest/${deployContestData.chain.toLowerCase()?.replace(" ", "")}/${
        deployContestData.address
      }`;

      toastDismiss();

      router.push(contestPath);
    }
  }, [deploymentProcess, deployContestData, router, addFundsToRewards]);

  return (
    <div className="flex flex-col gap-8 mt-12 lg:mt-[100px] animate-appear">
      <div className="flex flex-col gap-4">
        <p className="text-[24px] font-bold text-neutral-11 uppercase font-sabo-filled">
          🎉 LET'S DEPLOY THIS CONTEST 🎉
        </p>
        <p className="text-[18px] text-neutral-11">we'll redirect you to it as soon as it deploys...</p>
      </div>
      <DeploymentStatus deploymentProcess={deploymentProcess} addFundsToRewards={addFundsToRewards} />
    </div>
  );
};

export default CreateContestDeploying;
