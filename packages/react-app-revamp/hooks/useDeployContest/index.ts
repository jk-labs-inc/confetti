import { useFundPoolStore } from "@components/_pages/Create/pages/ContestRewards/components/FundPool/store";
import { toastLoading } from "@components/UI/Toast";
import { isSupabaseConfigured } from "@helpers/database";
import useEmailSignup from "@hooks/useEmailSignup";
import { useError } from "@hooks/useError";
import { useWallet } from "@hooks/useWallet";
import { useShallow } from "zustand/shallow";
import {
  deployContractToChain,
  finalizeContractDeployment,
  handleDeploymentError,
  indexContestInDatabase,
  prepareContestDataForIndexing,
  prepareDeploymentData,
  preparePromptData,
  updateDeploymentStore,
  validateDeploymentPrerequisites,
} from "./deployment";
import { orchestrateRewardsDeployment } from "./deployment/process";
import { useDeployContestStore } from "./store";

export const MAX_SUBMISSIONS_LIMIT = 1000;
export const JK_LABS_SPLIT_DESTINATION_DEFAULT = "0xDc652C746A8F85e18Ce632d97c6118e8a52fa738";

export function useDeployContest() {
  const { subscribeUser, checkIfEmailExists } = useEmailSignup();
  const {
    title,
    prompt,
    submissionOpen,
    getVotingOpenDate,
    getVotingCloseDate,
    advancedOptions,
    setDeployContestData,
    metadataFields,
    entryPreviewConfig,
    emailSubscriptionAddress,
    charge,
    priceCurve,
    setIsLoading,
    setIsSuccess,
    rewardPoolData,
    addFundsToRewards,
    setDeploymentPhase,
    setTransactionState,
    setFundTokenTransaction,
    setRewardsModuleAddress,
    setContestAddress,
    setChainId,
    deploymentProcess,
  } = useDeployContestStore(
    useShallow(state => ({
      title: state.title,
      prompt: state.prompt,
      submissionOpen: state.submissionOpen,
      getVotingOpenDate: state.getVotingOpenDate,
      getVotingCloseDate: state.getVotingCloseDate,
      advancedOptions: state.advancedOptions,
      setDeployContestData: state.setDeployContestData,
      metadataFields: state.metadataFields,
      entryPreviewConfig: state.entryPreviewConfig,
      emailSubscriptionAddress: state.emailSubscriptionAddress,
      charge: state.charge,
      priceCurve: state.priceCurve,
      setIsLoading: state.setIsLoading,
      setIsSuccess: state.setIsSuccess,
      rewardPoolData: state.rewardPoolData,
      addFundsToRewards: state.addFundsToRewards,
      setDeploymentPhase: state.setDeploymentPhase,
      setTransactionState: state.setTransactionState,
      setFundTokenTransaction: state.setFundTokenTransaction,
      setRewardsModuleAddress: state.setRewardsModuleAddress,
      setContestAddress: state.setContestAddress,
      setChainId: state.setChainId,
      deploymentProcess: state.deploymentProcess,
    })),
  );
  const { handleError } = useError();
  const { userAddress, chain } = useWallet();
  const { tokenWidgets } = useFundPoolStore(useShallow(state => ({ tokenWidgets: state.tokenWidgets })));

  const votingOpen = getVotingOpenDate();
  const votingClose = getVotingCloseDate();

  async function deployContest() {
    setIsLoading(true);
    setDeploymentPhase("deploying-contest");
    toastLoading({
      message: "contest is deploying...",
    });

    try {
      const { address: validatedAddress, chain: validatedChain } = validateDeploymentPrerequisites(userAddress, chain);

      const combinedPrompt = preparePromptData(prompt);

      const deploymentData = await prepareDeploymentData({
        address: validatedAddress,
        chain: validatedChain,
        combinedPrompt,
        contestData: {
          title,
          submissionOpen,
          votingOpen,
          votingClose,
          advancedOptions,
          charge,
          priceCurve,
          metadataFields,
          entryPreviewConfig,
        },
      });

      setTransactionState("deployContest", { status: "loading" });

      const { contractDeploymentHash, contractAddress } = await deployContractToChain(
        deploymentData.constructorArgs,
        validatedAddress,
      );

      setTransactionState("deployContest", { status: "success", hash: contractDeploymentHash });

      const { sortingEnabled } = await finalizeContractDeployment(contractAddress, validatedChain.id);

      updateDeploymentStore(
        setDeployContestData,
        contractDeploymentHash,
        contractAddress,
        sortingEnabled,
        validatedChain.name ?? "",
        validatedChain.id,
      );

      setContestAddress(contractAddress);
      setChainId(validatedChain.id);

      const contestData = prepareContestDataForIndexing({
        constructorArgs: deploymentData.constructorArgs,
        combinedPrompt,
        contractAddress,
        address: validatedAddress,
        chainName: validatedChain.name,
        contestData: {
          title,
          submissionOpen,
          votingOpen,
          votingClose,
          charge,
        },
      });

      subscribeToEmail(emailSubscriptionAddress).catch(error => {
        console.error("Failed to subscribe email:", error);
      });

      await indexContestInDatabase(contestData);

      await orchestrateRewardsDeployment({
        contestAddress: contractAddress,
        chainId: validatedChain.id,
        userAddress: validatedAddress,
        rewardPoolData,
        tokenWidgets,
        addFundsToRewards,
        onPhaseChange: setDeploymentPhase,
        onTransactionUpdate: setTransactionState,
        onFundTokenUpdate: setFundTokenTransaction,
        onRewardsModuleAddress: setRewardsModuleAddress,
        onCriticalPhaseComplete: () => {
          setIsSuccess(true);
          setIsLoading(false);
        },
      });
    } catch (error) {
      const contestDeployed = deploymentProcess.transactions.deployContest.status === "success";

      if (contestDeployed) {
        setIsSuccess(true);
        setIsLoading(false);
      } else {
        handleDeploymentError(error, handleError, setIsLoading);
      }
    }
  }

  async function subscribeToEmail(emailAddress: string) {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured");
    }

    if (!emailAddress) {
      return;
    }

    const emailExists = await checkIfEmailExists({ emailAddress, userAddress, displayToasts: false });

    if (emailExists || !userAddress) {
      return;
    }

    await subscribeUser(emailAddress, userAddress, false);
  }

  return {
    deployContest,
  };
}
