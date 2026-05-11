import { DeployContestStore, useDeployContestStore } from "@hooks/useDeployContest/store";
import { useCallback } from "react";
import { useWallet } from "@hooks/useWallet";
import { MULTIPLIER_RANGES } from "@hooks/useDeployContest/slices/contestMonetizationSlice";
import { StepTitle, getStepNumber } from "../types";

const stepValidations: Record<StepTitle, (state: DeployContestStore, isConnected: boolean) => boolean> = {
  [StepTitle.Entries]: state => {
    return true;
  },
  [StepTitle.Voting]: (state, isConnected) => {
    const range = MULTIPLIER_RANGES[state.priceCurve.type];
    return (
      isConnected &&
      !!state.charge.costToVote &&
      state.charge.costToVote > 0 &&
      state.priceCurve.multipler >= range.min &&
      state.priceCurve.multipler <= range.max
    );
  },

  [StepTitle.Timing]: state => {
    const validation = state.validateTiming();
    if (!validation.isValid) {
      state.setError(StepTitle.Timing, {
        step: getStepNumber(StepTitle.Timing),
        message: validation.error || "Invalid timing",
      });
      return false;
    }
    state.setError(StepTitle.Timing, { step: getStepNumber(StepTitle.Timing), message: "" });
    return true;
  },

  [StepTitle.Rewards]: state => {
    const validation = state.validateRewards();
    if (!validation.isValid) {
      state.setError(StepTitle.Rewards, {
        step: getStepNumber(StepTitle.Rewards),
        message: validation.error || "Invalid rewards",
      });
      return false;
    }

    const filledRecipients = state.rewardPoolData.recipients.filter(
      recipient => recipient.proportion !== null && recipient.proportion > 0,
    );

    state.setRewardPoolData({
      ...state.rewardPoolData,
      recipients: filledRecipients,
    });

    state.setError(StepTitle.Rewards, { step: getStepNumber(StepTitle.Rewards), message: "" });
    return true;
  },
  [StepTitle.Rules]: state => {
    return !!state.title && !!state.prompt.summarize && !!state.prompt.evaluateVoters;
  },

  [StepTitle.Confirm]: (state, isConnected) => {
    return isConnected;
  },
};

export const useNextStep = () => {
  const { isConnected } = useWallet();
  const { step: currentStep, setStep } = useDeployContestStore(state => state);

  const onNextStep = useCallback(
    (targetStep?: number, availableSteps?: StepTitle[]) => {
      // if we're going backwards, allow without validation
      if (targetStep !== undefined && targetStep < currentStep) {
        setStep(targetStep);
        return;
      }

      const state = useDeployContestStore.getState();

      // only validate steps that are in our current flow
      for (let i = currentStep; i < (targetStep ?? currentStep + 1); i++) {
        const stepToValidate = availableSteps?.[i];
        if (!stepToValidate) continue;

        const validationFn = stepValidations[stepToValidate];
        if (!validationFn) continue;

        const isValid = validationFn(state, isConnected);

        if (!isValid) {
          return;
        }
      }

      setStep(targetStep ?? currentStep + 1);
    },
    [currentStep, setStep, isConnected],
  );

  return onNextStep;
};
