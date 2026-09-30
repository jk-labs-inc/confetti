import { legacyPromptTransform } from "@components/_pages/Contest/components/Prompt/utils/legacyPromptTransform";
import { parsePrompt } from "@components/_pages/Contest/components/Prompt/utils";
import { useContestStore } from "@hooks/useContest/store";
import { ContestStateEnum, useContestStateStore } from "@hooks/useContestState/store";
import { Interweave } from "interweave";
import { UrlMatcher } from "interweave-autolink";
import { FC } from "react";

interface ContestPromptBodyProps {
  prompt: string;
}

const ContestPromptBody: FC<ContestPromptBodyProps> = ({ prompt }) => {
  const isV3 = useContestStore(state => state.isV3);
  const isContestCanceled = useContestStateStore(state => state.contestState) === ContestStateEnum.Canceled;

  if (!isV3) {
    return (
      <div className="prose prose-invert max-w-none">
        <Interweave content={prompt} matchers={[new UrlMatcher("url")]} transform={legacyPromptTransform} />
      </div>
    );
  }

  const { contestSummary, contestEvaluate, contestContactDetails } = parsePrompt(prompt);
  const sections = [contestSummary, contestEvaluate, contestContactDetails].filter(Boolean);

  return (
    <div
      className={`prose prose-invert max-w-none prose-p:text-neutral-11 flex flex-col ${
        isContestCanceled ? "line-through" : ""
      }`}
    >
      {sections.map((section, index) => (
        <div key={index} className={index > 0 ? "mt-6" : ""}>
          <Interweave content={`~ ${section}`} matchers={[new UrlMatcher("url")]} />
        </div>
      ))}
    </div>
  );
};

export default ContestPromptBody;
