import ContestPromptBody from "@components/_pages/Contest/components/Prompt/components/Body";
import EditContestPrompt from "@components/_pages/Contest/components/Prompt/components/Page/components/Layout/V3/components/EditContestPrompt";
import { useContestStore } from "@hooks/useContest/store";
import { FC } from "react";
import { useShallow } from "zustand/shallow";

const DESCRIPTION_MEASURE_CLASS_NAME = "max-w-[76ch] wrap-break-word";

interface DescriptionPanelProps {
  id: string;
  isOpen: boolean;
  prompt: string;
}

const DescriptionPanel: FC<DescriptionPanelProps> = ({ id, isOpen, prompt }) => {
  const { isV3, canEditTitleAndDescription } = useContestStore(
    useShallow(state => ({ isV3: state.isV3, canEditTitleAndDescription: state.canEditTitleAndDescription })),
  );

  return (
    <div
      id={id}
      inert={!isOpen}
      className="grid transition-[grid-template-rows] duration-300 ease-out"
      style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
    >
      <div className="min-h-0 overflow-hidden">
        <div
          className={`relative mt-4 w-fit max-w-full max-h-[40vh] overflow-y-auto overscroll-contain [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.2)_transparent] rounded-2xl border border-white/10 bg-primary-1 px-5 py-4 transition-opacity duration-300 ease-out ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
        >
          {isV3 && canEditTitleAndDescription ? (
            <div className="float-right ml-4">
              <EditContestPrompt canEditPrompt prompt={prompt} />
            </div>
          ) : null}
          <div className={DESCRIPTION_MEASURE_CLASS_NAME}>
            <ContestPromptBody prompt={prompt} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DescriptionPanel;
