import useContestVoteTimer from "@components/_pages/Submission/hooks/useContestVoteTimer";
import useNavigateProposals from "@components/_pages/Submission/hooks/useNavigateProposals";
import StickyVoteFooter from "@components/_pages/Submission/Mobile/components/VoteFooter";
import SubmissionPageMobileVoting from "@components/_pages/Submission/Mobile/components/Voting";
import { useSubmissionPageStore } from "@components/_pages/Submission/store";
import { useState } from "react";
import { useShallow } from "zustand/shallow";

const SubmissionPageMobileVotingFooter = () => {
  const voteTimings = useSubmissionPageStore(useShallow(state => state.voteTimings));
  const { totalProposals } = useNavigateProposals();
  const [showVotingModal, setShowVotingModal] = useState(false);
  const { isVotingOpen } = useContestVoteTimer({
    voteStart: voteTimings?.voteStart ?? null,
    contestDeadline: voteTimings?.contestDeadline ?? null,
  });

  if (!isVotingOpen) return null;

  return (
    <>
      <StickyVoteFooter totalProposals={totalProposals} setShowVotingModal={setShowVotingModal} />
      {showVotingModal && (
        <SubmissionPageMobileVoting isOpen={showVotingModal} onClose={() => setShowVotingModal(false)} />
      )}
    </>
  );
};

export default SubmissionPageMobileVotingFooter;
