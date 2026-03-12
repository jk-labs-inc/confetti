import { parsePrompt } from "@components/_pages/Contest/components/Prompt/utils";
import { ContestStateEnum, useContestStateStore } from "@hooks/useContestState/store";
import { Interweave } from "interweave";
import { UrlMatcher } from "interweave-autolink";
import { FC, useState } from "react";
import EditContestPrompt from "./components/EditContestPrompt";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useDescriptionExpansionStore } from "./store";

interface ContestPromptPageV3LayoutProps {
  prompt: string;
  canEditTitleAndDescription: boolean;
}

const ContestPromptPageV3Layout: FC<ContestPromptPageV3LayoutProps> = ({ prompt, canEditTitleAndDescription }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { contestState } = useContestStateStore(state => state);
  const { triggerRecalculation } = useDescriptionExpansionStore();
  const isContestCanceled = contestState === ContestStateEnum.Canceled;
  const { contestSummary, contestEvaluate, contestContactDetails } = parsePrompt(prompt);

  const renderSection = (content: string, showDivider: boolean) => {
    if (!content) return null;

    return (
      <>
        {showDivider && <div className="bg-linear-to-r from-neutral-7 w-full h-px my-6" />}
        <Interweave content={content} matchers={[new UrlMatcher("url")]} />
      </>
    );
  };

  const handleToggleExpanded = () => {
    setIsExpanded(prev => !prev);
    setTimeout(() => {
      triggerRecalculation();
    }, 100);
  };

  return (
    <div className="flex items-start gap-3 w-full">
      <EditContestPrompt canEditPrompt={canEditTitleAndDescription} prompt={prompt} />

      {isExpanded ? (
        <div className="flex flex-col w-full rounded-l-[10px] border-l border-t border-b border-neutral-4 bg-primary-1 px-5 pt-3 pb-5">
          <button
            onClick={handleToggleExpanded}
            className="flex items-center justify-center gap-[6px] w-40 h-6 rounded-[32px] bg-neutral-3 text-base text-neutral-11 mb-5"
          >
            full description
            <ChevronDownIcon
              width={16}
              height={16}
              className="mt-1 rotate-180 transition-transform duration-300"
            />
          </button>

          <div
            className={`prose prose-invert prose-p:text-neutral-9 flex flex-col ${isContestCanceled ? "line-through" : ""}`}
          >
            {renderSection(contestSummary, false)}
            {renderSection(contestEvaluate, true)}
            {renderSection(contestContactDetails, true)}
          </div>
        </div>
      ) : (
        <button
          onClick={handleToggleExpanded}
          className="flex items-center justify-center gap-[6px] w-40 h-6 rounded-[32px] bg-primary-1 text-base text-neutral-11 transition-colors duration-300 hover:bg-neutral-4"
        >
          full description
          <ChevronDownIcon
            width={16}
            height={16}
            className="mt-1 transition-transform duration-300"
          />
        </button>
      )}
    </div>
  );
};

export default ContestPromptPageV3Layout;
