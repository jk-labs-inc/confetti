import { HEADER_HEIGHT as PRICE_CURVE_HEADER_HEIGHT } from "@components/PriceCurve/constants";
import PriceCurveWrapper from "@components/PriceCurve/wrapper";
import ContestStickyTrigger from "@components/_pages/Contest/components/ContestStickyTrigger";
import DialogModalSendProposal from "@components/_pages/DialogModalSendProposal";
import ListProposals from "@components/_pages/ListProposals";
import useContest from "@hooks/useContest";
import { useContestStore } from "@hooks/useContest/store";
import { ContestStateEnum, useContestStateStore } from "@hooks/useContestState/store";
import { ContestStatus, useContestStatusStore } from "@hooks/useContestStatus/store";
import { useProposalStore } from "@hooks/useProposal/store";
import moment from "moment";
import { useState } from "react";
import { useMediaQuery } from "react-responsive";
import { useShallow } from "zustand/shallow";
import ContestPrompt from "../components/Prompt";
import ContestStickyCards from "../components/StickyCards";
import ContestSubmitBar from "./ContestSubmitBar";
import { useContestSubmitButton } from "./useContestSubmitButton";

const ContestTab = () => {
  const [isSubmitProposalModalOpen, setIsSubmitProposalModalOpen] = useState(false);
  const { contestPrompt, votesClose } = useContestStore(
    useShallow(state => ({
      contestPrompt: state.contestPrompt,
      votesClose: state.votesClose,
    })),
  );
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
  const { variant } = useContestSubmitButton({
    onOpenModal: () => setIsSubmitProposalModalOpen(true),
  });

  const isContestOver = votesClose ? moment().isSameOrAfter(moment(votesClose)) : false;
  const [isPriceCurveExpanded, setIsPriceCurveExpanded] = useState(!isContestOver);

  const isSubmissionOpen = contestStatus === ContestStatus.SubmissionOpen;
  const hasMobileFixedBar = isMobile && isSubmissionOpen && (variant.kind === "counter-submit" || variant.kind === "connect");

  return (
    <div className="animate-fade-in">
      <div className="mt-4 md:mt-6 flex flex-col gap-4 md:gap-6">
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
        {isSubmissionOpen && <ContestSubmitBar variant={variant} />}
        <ContestPrompt prompt={contestPrompt} type="page" />
      </div>

      <div className="mt-4 md:mt-6 border-t border-neutral-4" />
      <div className="mt-3 md:mt-4 relative">
        <PriceCurveWrapper
          height={250}
          showPriceWarning
          noPadding
          showAxisLabels
          isExpanded={isPriceCurveExpanded}
          onToggleExpand={() => setIsPriceCurveExpanded(prev => !prev)}
        />
        <div
          className="absolute left-0 right-0 pointer-events-none"
          style={{ top: PRICE_CURVE_HEADER_HEIGHT }}
        >
          <ContestStickyTrigger trigger="chart" />
        </div>
      </div>
      <div className="mt-4 hidden md:block border-t border-neutral-4" />

      {isMobile && <ContestStickyCards />}

      <div className={`mt-6 ${hasMobileFixedBar ? "pb-24" : ""} ${isInPwaMode ? "mb-12" : "mb-0"}`}>
        <div className="flex flex-col gap-2">
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
