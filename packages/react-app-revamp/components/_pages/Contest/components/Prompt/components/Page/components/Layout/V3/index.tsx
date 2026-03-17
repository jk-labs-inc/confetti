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

  const renderSection = (content: string, isFirst: boolean) => {
    if (!content) return null;

    return (
      <div className={isFirst ? "" : "mt-6"}>
        <Interweave content={`~ ${content}`} matchers={[new UrlMatcher("url")]} />
      </div>
    );
  };

  const handleToggleExpanded = () => {
    setIsExpanded(prev => !prev);
    setTimeout(() => {
      triggerRecalculation();
    }, 100);
  };

  return (
    <div className="flex flex-col w-full md:w-[60%]">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 -translate-x-full -ml-4 hidden md:block">
          <EditContestPrompt canEditPrompt={canEditTitleAndDescription} prompt={prompt} />
        </div>
        <button
          onClick={handleToggleExpanded}
          className={`flex items-center gap-[6px] text-base transition-all duration-300 ease-out ${
            isExpanded
              ? "w-fit rounded-t-[16px] border-t border-l border-r border-neutral-4 bg-primary-1 px-4 py-1 text-neutral-11 font-bold relative z-10 -mb-px"
              : "justify-center w-40 h-6 rounded-[32px] bg-primary-1 text-neutral-9 hover:bg-neutral-4"
          }`}
        >
          full description
          <ChevronDownIcon
            width={16}
            height={16}
            className={`mt-1 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
          />
        </button>
        <div className="md:hidden">
          <EditContestPrompt canEditPrompt={canEditTitleAndDescription} prompt={prompt} />
        </div>
      </div>

      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div
            className={`rounded-[16px] rounded-tl-none border border-neutral-4 bg-primary-1 px-5 pt-5 pb-5 transition-opacity duration-300 ease-out ${isExpanded ? "opacity-100" : "opacity-0"}`}
          >
            <div
              className={`prose prose-invert max-w-none prose-p:text-neutral-11 flex flex-col ${isContestCanceled ? "line-through" : ""}`}
            >
              {renderSection(contestSummary, true)}
              {renderSection(contestEvaluate, false)}
              {renderSection(contestContactDetails, false)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContestPromptPageV3Layout;
