import { validateMultiplier } from "@hooks/useDeployContest/slices/contestMonetizationSlice";
import { DeployContestStore, useDeployContestStore } from "@hooks/useDeployContest/store";
import { useMemo } from "react";
import { useShallow } from "zustand/shallow";
import { useFundPoolStore } from "../sections/Rewards/components/FundPool/store";
import { useCreateContestFormStore } from "../store";
import { CreateFormError, CreateFormErrorLocation } from "../types";

interface CreateContestValidationDeps {
  isConnected: boolean;
  emailError: string | null;
  phoneNumberError: string | null;
}

export const getCreateContestErrors = (
  state: DeployContestStore,
  deps: CreateContestValidationDeps,
): CreateFormError[] => {
  const errors: CreateFormError[] = [];

  if (!state.title) {
    errors.push({ location: "title", message: "must add a title" });
  }

  const timing = state.validateTiming();
  if (!timing.isValid && timing.error) {
    errors.push({ location: "duration", message: timing.error });
  }

  if (!state.prompt.summarize) {
    errors.push({ location: "description", message: "must summarize the contest" });
  }
  if (!state.prompt.evaluateVoters) {
    errors.push({ location: "description", message: "must explain how voters should evaluate entries" });
  }

  // skipped while disconnected: pricing can't load without a chain, and the CTA handles sign-in
  if (deps.isConnected) {
    if (state.charge.error) {
      errors.push({ location: "priceCurve", message: "couldn't load vote pricing — open this section to retry" });
    } else if (state.charge.costToVote <= 0) {
      errors.push({ location: "priceCurve", message: "still loading vote pricing — try again in a moment" });
    } else {
      const multiplierError = validateMultiplier(state.priceCurve.multipler, state.priceCurve.type);
      if (multiplierError) {
        errors.push({ location: "priceCurve", message: multiplierError });
      }
    }
  }

  const rewards = state.validateRewards();
  if (!rewards.isValid && rewards.error) {
    errors.push({ location: "rewards", message: rewards.error });
  }

  if (deps.emailError) {
    errors.push({ location: "signup", message: deps.emailError });
  }
  if (deps.phoneNumberError) {
    errors.push({ location: "signup", message: deps.phoneNumberError });
  }

  return errors;
};

// stable sentinel returned by the selectors while nothing is displayed
const EMPTY = {};

export const useCreateContestValidation = (deps: CreateContestValidationDeps) => {
  const submitCount = useCreateContestFormStore(state => state.submitCount);
  const submitAttempted = submitCount > 0;

  // until the first submit no errors are displayed, so skip subscribing to form state —
  // keystrokes in the always-mounted sections must not re-render the whole page
  const validationInputs = useDeployContestStore(
    useShallow(state =>
      submitAttempted
        ? {
            title: state.title,
            prompt: state.prompt,
            votingOpen: state.votingOpen,
            votingDuration: state.votingDuration,
            charge: state.charge,
            priceCurve: state.priceCurve,
            rewardPoolData: state.rewardPoolData,
            addFundsToRewards: state.addFundsToRewards,
          }
        : EMPTY,
    ),
  );
  // validateRewards reads the fund-pool store imperatively; subscribe so errors recompute live
  const fundPoolInputs = useFundPoolStore(
    useShallow(state =>
      submitAttempted ? { tokenWidgets: state.tokenWidgets, isError: state.isError } : EMPTY,
    ),
  );

  // submitCount (not just the boolean) is a dependency so every create-click revalidates
  // time-dependent checks like validateTiming even when no subscribed input changed
  const errors = useMemo(
    () => (submitAttempted ? getCreateContestErrors(useDeployContestStore.getState(), deps) : []),
    [submitCount, validationInputs, fundPoolInputs, deps.isConnected, deps.emailError, deps.phoneNumberError],
  );

  const errorFor = (location: CreateFormErrorLocation) =>
    errors.find(error => error.location === location)?.message ?? null;

  // imperative form for the submit path — always validates, regardless of submitAttempted
  const validate = () => getCreateContestErrors(useDeployContestStore.getState(), deps);

  return { errors, errorFor, validate };
};
