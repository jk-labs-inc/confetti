import PriceCurveWrapper from "@components/PriceCurve/wrapper";
import useContestVoteTimer, { VotingStatus } from "@components/_pages/Submission/hooks/useContestVoteTimer";
import { useSubmissionPageStore } from "@components/_pages/Submission/store";
import useProposalIdStore from "@hooks/useProposalId/store";
import { useRef } from "react";
import { useShallow } from "zustand/shallow";
import SubmissionPageDesktopVotingAreaWidgetVotingNotOpen from "./components/Placeholder/components/VotingNotOpen";
import SubmissionPageDesktopVotingAreaWidget from "./components/Widget";
import SubmissionPageDesktopVotingAreaWidgetVoters from "./components/Widget/components/Voters";

const SubmissionPageDesktopVotingArea = () => {
  const proposalId = useProposalIdStore(useShallow(state => state.proposalId));
  const voteTimings = useSubmissionPageStore(useShallow(state => state.voteTimings));
  const { votingStatus, timeRemaining } = useContestVoteTimer({
    voteStart: voteTimings?.voteStart ?? null,
    contestDeadline: voteTimings?.contestDeadline ?? null,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="flex flex-col p-4 gap-4 bg-primary-1 rounded-4xl xl:w-[480px] h-full">
      <PriceCurveWrapper showPriceWarning />
      {votingStatus === VotingStatus.VotingNotOpen ? (
        <SubmissionPageDesktopVotingAreaWidgetVotingNotOpen timeRemaining={timeRemaining} />
      ) : null}
      {votingStatus === VotingStatus.VotingOpen ? <SubmissionPageDesktopVotingAreaWidget /> : null}
      {votingStatus === VotingStatus.VotingOpen || votingStatus === VotingStatus.VotingClosed ? (
        <SubmissionPageDesktopVotingAreaWidgetVoters proposalId={proposalId} />
      ) : null}
    </div>
  );
};

export default SubmissionPageDesktopVotingArea;
