import DialogModalSendProposal from "@components/_pages/DialogModalSendProposal";
import ListProposals from "@components/_pages/ListProposals";
import useContest from "@hooks/useContest";
import { useContestStore } from "@hooks/useContest/store";
import { ContestStateEnum, useContestStateStore } from "@hooks/useContestState/store";
import { ContestStatus, useContestStatusStore } from "@hooks/useContestStatus/store";
import { useProposalStore } from "@hooks/useProposal/store";
import { useState } from "react";
import { useMediaQuery } from "react-responsive";
import ContestPrompt from "../components/Prompt";
import ProposalStatistics from "../components/ProposalStatistics";
import ContestStickyCards from "../components/StickyCards";
import EntryPreviewTitleToggle from "../components/EntryPreviewTitleToggle";
import { useContestSubmitButton } from "./useContestSubmitButton";
import { useShallow } from "zustand/shallow";

const ContestTab = () => {
  const [isSubmitProposalModalOpen, setIsSubmitProposalModalOpen] = useState(false);
  const contestPrompt = useContestStore(useShallow(state => state.contestPrompt));
  const contestStatus = useContestStatusStore(useShallow(state => state.contestStatus));
  const { isListProposalsLoading, isListProposalsSuccess } = useProposalStore(
    useShallow(state => ({
      isListProposalsLoading: state.isListProposalsLoading,
      isListProposalsSuccess: state.isListProposalsSuccess,
    })),
  );
  const { isLoading: isContestLoading, isSuccess: isContestSuccess } = useContest();
  const contestState = useContestStateStore(useShallow(state => state.contestState));
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isInPwaMode = window.matchMedia("(display-mode: standalone)").matches;
  const isContestCanceled = contestState === ContestStateEnum.Canceled;
  const { renderSubmitButton } = useContestSubmitButton({
    onOpenModal: () => setIsSubmitProposalModalOpen(true),
  });

  return (
    <div className="animate-fade-in">
      <div className="mt-4 md:mt-6">
        <div className="flex flex-col gap-6">
          {isContestCanceled ? (
            <div className="flex">
              <div className="inline-block border border-negative-11 py-2 px-4 rounded-lg">
                <p className="text-negative-11 text-[16px] md:text-[20px] font-bold text-center">
                  {isMobile
                    ? "this contest was canceled by the creator"
                    : "This contest was canceled by the creator and is no longer active"}
                </p>
              </div>
            </div>
          ) : null}
          <ContestPrompt prompt={contestPrompt} type="page" />
        </div>
      </div>
      {contestStatus === ContestStatus.SubmissionOpen && (
        <div className="fixed z-50 bottom-20 left-0 right-0 flex w-full justify-center md:justify-normal md:static md:mt-8">
          {renderSubmitButton()}
        </div>
      )}
      <ContestStickyCards />

      <div className={`mt-4 ${isInPwaMode ? "mb-12" : "mb-0"}`}>
        <div className="flex flex-col gap-2">
          {contestStatus !== ContestStatus.ContestOpen && !isContestLoading && (
            <div className="flex items-center gap-12 pb-4 ">
              <ProposalStatistics contestStatus={contestStatus} />
              <EntryPreviewTitleToggle />
            </div>
          )}

          {!isContestLoading && !isListProposalsLoading && isContestSuccess && isListProposalsSuccess && (
            <div className="animate-fade-in">
              <ListProposals />
            </div>
          )}
        </div>
      </div>

      <DialogModalSendProposal isOpen={isSubmitProposalModalOpen} setIsOpen={setIsSubmitProposalModalOpen} />
    </div>
  );
};

export default ContestTab;
