import { useFundPoolStore } from "@components/_pages/Create/sections/Rewards/components/FundPool/store";
import { toastLoading } from "@components/UI/Toast";
import { isSupabaseConfigured } from "@helpers/database";
import useEmailSignup from "@hooks/useEmailSignup";
import usePhoneNumberSignup from "@hooks/usePhoneNumberSignup";
import { useError } from "@hooks/useError";
import { useWallet } from "@hooks/useWallet";
import { isPhoneNumberEmpty, isValidPhoneNumber, phoneNumberToE164 } from "lib/phone";
import { PhoneNumberValue } from "lib/phone/types";
import { useShallow } from "zustand/shallow";
import {
  deployContractToChain,
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

export const MAX_SUBMISSIONS_LIMIT = 50;
export const JK_LABS_SPLIT_DESTINATION_DEFAULT = "0xDc652C746A8F85e18Ce632d97c6118e8a52fa738";

export function useDeployContest() {
  const { subscribeUser, checkIfEmailExists } = useEmailSignup();
  const { subscribePhoneNumber, checkIfPhoneNumberExists } = usePhoneNumberSignup();
  const {
    title,
    prompt,
    submissionOpen,
    getVotingOpenDate,
    getVotingCloseDate,
    advancedOptions,
    setDeployContestData,
    entryPreviewConfig,
    emailSubscriptionAddress,
    phoneNumberForSubscription,
    charge,
    priceCurve,
    setIsLoading,
    setIsSuccess,
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
      entryPreviewConfig: state.entryPreviewConfig,
      emailSubscriptionAddress: state.emailSubscriptionAddress,
      phoneNumberForSubscription: state.phoneNumberForSubscription,
      charge: state.charge,
      priceCurve: state.priceCurve,
      setIsLoading: state.setIsLoading,
      setIsSuccess: state.setIsSuccess,
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
          entryPreviewConfig,
        },
      });

      setTransactionState("deployContest", { status: "loading" });

      const { contractDeploymentHash, contractAddress } = await deployContractToChain(
        deploymentData.constructorArgs,
        validatedAddress,
      );

      setTransactionState("deployContest", { status: "success", hash: contractDeploymentHash });

      updateDeploymentStore(
        setDeployContestData,
        contractDeploymentHash,
        contractAddress,
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

      subscribeToPhoneNumber(phoneNumberForSubscription).catch(error => {
        console.error("Failed to subscribe phone number:", error);
      });

      await indexContestInDatabase(contestData);

      // read at call time, not from the render closure — the submit handler strips
      // empty reward rows in the same tick it invokes deployContest
      const { rewardPoolData: currentRewardPoolData } = useDeployContestStore.getState();
      const { tokenWidgets: currentTokenWidgets } = useFundPoolStore.getState();

      await orchestrateRewardsDeployment({
        contestAddress: contractAddress,
        chainId: validatedChain.id,
        userAddress: validatedAddress,
        rewardPoolData: currentRewardPoolData,
        tokenWidgets: currentTokenWidgets,
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

  async function subscribeToPhoneNumber(phoneNumber: PhoneNumberValue) {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured");
    }

    if (isPhoneNumberEmpty(phoneNumber) || !isValidPhoneNumber(phoneNumber)) {
      return;
    }

    const phoneNumberE164 = phoneNumberToE164(phoneNumber);
    const phoneNumberExists = await checkIfPhoneNumberExists({
      phoneNumber: phoneNumberE164,
      userAddress,
      displayToasts: false,
    });

    if (phoneNumberExists || !userAddress) {
      return;
    }

    await subscribePhoneNumber(phoneNumberE164, userAddress, false);
  }

  return {
    deployContest,
  };
}
