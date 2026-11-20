import { useContestStore } from "@hooks/useContest/store";
import moment from "moment";
import { FC, useEffect, useState } from "react";
import { hasDescription, parsePrompt } from "../../utils";
import ContestPromptModalLegacyLayout from "./components/Layout/Legacy";
import ContestPromptModalV3Layout from "./components/Layout/V3";

interface ContestPromptModalProps {
  prompt: string;
  hidePrompt?: boolean;
}

const ContestPromptModal: FC<ContestPromptModalProps> = ({ prompt, hidePrompt = false }) => {
  const { isV3, votesClose, contestName } = useContestStore(state => state);
  const [isPromptOpen, setIsPromptOpen] = useState(moment().isBefore(votesClose) && !hidePrompt);
  const { contestTitle, contestSummary, contestEvaluate, contestContactDetails } = parsePrompt(prompt);

  useEffect(() => {
    setIsPromptOpen(!hidePrompt);
  }, [hidePrompt]);

  return (
    <>
      {isV3 ? (
        <ContestPromptModalV3Layout
          contestName={contestName}
          contestSummary={contestSummary}
          contestEvaluate={contestEvaluate}
          contestContactDetails={contestContactDetails}
          hasDescription={hasDescription(prompt)}
          isPromptOpen={isPromptOpen}
          setIsPromptOpen={setIsPromptOpen}
        />
      ) : (
        <ContestPromptModalLegacyLayout prompt={prompt} isPromptOpen={isPromptOpen} setIsPromptOpen={setIsPromptOpen} />
      )}
    </>
  );
};

export default ContestPromptModal;
