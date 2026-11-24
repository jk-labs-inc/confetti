import { DEFAULT_GUIDANCE, Guidance } from "@hooks/useDeployContest/slices/contestInfoSlice";
import { useDeployContestStore } from "@hooks/useDeployContest/store";
import { useEffect } from "react";
import { reseedUntouchedGuidance } from "../sections/Description/components/PromptEditors/utils";

const NO_GUIDANCE: Guidance = { evaluateVoters: "", contactDetails: "" };

export const useSeedDefaultGuidance = (isDescriptionOptional: boolean) => {
  useEffect(() => {
    const state = useDeployContestStore.getState();
    const reseeded = reseedUntouchedGuidance(state, isDescriptionOptional ? NO_GUIDANCE : DEFAULT_GUIDANCE);

    if (
      reseeded.seededGuidance.evaluateVoters === state.seededGuidance.evaluateVoters &&
      reseeded.seededGuidance.contactDetails === state.seededGuidance.contactDetails
    ) {
      return;
    }

    state.setPrompt(reseeded.prompt);
    state.setSeededGuidance(reseeded.seededGuidance);
  }, [isDescriptionOptional]);
};
