import { useDeployContestStore } from "@hooks/useDeployContest/store";
import { useEffect } from "react";
import { useShallow } from "zustand/shallow";
import { generateDynamicSummary } from "../sections/Description/components/PromptEditors/utils";

export const useSeedDefaultSummary = () => {
  const { votingOpen, votingDuration, priceCurveType } = useDeployContestStore(
    useShallow(state => ({
      votingOpen: state.votingOpen,
      votingDuration: state.votingDuration,
      priceCurveType: state.priceCurve.type,
    })),
  );

  useEffect(() => {
    const state = useDeployContestStore.getState();

    const isVirgin = !state.prompt.summarize && state.generatedSummary === null;
    const isUntouched = state.prompt.summarize === state.generatedSummary;
    if (!isVirgin && !isUntouched) return;

    const generated = generateDynamicSummary(priceCurveType, state.getVotingOpenDate(), state.getVotingCloseDate());
    if (state.prompt.summarize !== generated) {
      state.setPrompt({ ...state.prompt, summarize: generated });
    }
    if (state.generatedSummary !== generated) {
      state.setGeneratedSummary(generated);
    }
  }, [votingOpen, votingDuration, priceCurveType]);
};
