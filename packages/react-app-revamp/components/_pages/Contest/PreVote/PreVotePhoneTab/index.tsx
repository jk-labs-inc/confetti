import ContestSubmitBar from "@components/_pages/Contest/Contest/ContestSubmitBar";
import { useContestSubmitButton } from "@components/_pages/Contest/Contest/useContestSubmitButton";
import DialogModalSendProposal from "@components/_pages/DialogModalSendProposal";
import ListProposals from "@components/_pages/ListProposals";
import { ContestStatus, useContestStatusStore } from "@hooks/useContestStatus/store";
import { useEntriesReady } from "@layouts/LayoutViewContest/hooks/useEntriesReady";
import { FC, useId, useState } from "react";
import PreVoteFacts from "../components/PreVoteFacts";
import PreVotePriceCurve from "../components/PreVotePriceCurve";
import PreVotePhoneCard from "../PreVotePhoneCard";

const PreVotePhoneTab: FC = () => {
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isPriceCurveOpen, setIsPriceCurveOpen] = useState(false);
  const priceCurvePanelId = useId();
  const areEntriesReady = useEntriesReady();
  const isSubmissionOpen = useContestStatusStore(state => state.contestStatus) === ContestStatus.SubmissionOpen;
  const { variant } = useContestSubmitButton({ onOpenModal: () => setIsSubmitModalOpen(true) });
  const hasFixedSubmitBar = isSubmissionOpen && (variant.kind === "counter-submit" || variant.kind === "connect");
  const isInstalledApp = window.matchMedia("(display-mode: standalone)").matches;

  return (
    <div className={`animate-fade-in mt-4 flex flex-col gap-3.5 ${hasFixedSubmitBar ? "pb-24" : ""} ${isInstalledApp ? "mb-12" : ""}`}>
      <PreVotePhoneCard />
      {isSubmissionOpen && <ContestSubmitBar variant={variant} />}
      <PreVoteFacts
        isPriceCurveOpen={isPriceCurveOpen}
        priceCurvePanelId={priceCurvePanelId}
        onTogglePriceCurve={() => setIsPriceCurveOpen(prev => !prev)}
      />
      {isPriceCurveOpen && <PreVotePriceCurve id={priceCurvePanelId} />}
      {areEntriesReady && (
        <div className="animate-fade-in">
          <ListProposals />
        </div>
      )}
      <DialogModalSendProposal isOpen={isSubmitModalOpen} setIsOpen={setIsSubmitModalOpen} />
    </div>
  );
};

export default PreVotePhoneTab;
