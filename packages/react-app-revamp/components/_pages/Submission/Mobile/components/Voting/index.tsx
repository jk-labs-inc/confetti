import AddFunds from "@components/AddFunds";
import PriceCurveWrapper from "@components/PriceCurve/wrapper";
import Drawer from "@components/UI/Drawer";
import VotingWidget from "@components/Voting";
import { useVotingActions } from "@components/_pages/Submission/hooks/useVotingActions";
import { useSubmissionPageStore } from "@components/_pages/Submission/store";
import { ContestStateEnum } from "@hooks/useContestState/store";
import { FC, useState } from "react";
import { useShallow } from "zustand/shallow";
import { useVotingSetupMobile } from "./hooks/useVotingSetupMobile";

interface SubmissionPageMobileVotingProps {
  isOpen: boolean;
  onClose?: () => void;
}

const SubmissionPageMobileVoting: FC<SubmissionPageMobileVotingProps> = ({ isOpen, onClose }) => {
  const [showAddFunds, setShowAddFunds] = useState(false);
  const submissionsCount = useSubmissionPageStore(useShallow(state => state.allProposalIds.length));
  const {
    contestConfig,
    currentPricePerVote,
    currentPricePerVoteRaw,
    isVotingOpen,
    charge,
    contestState,
    isChargeLoading,
    votesClose,
  } = useVotingSetupMobile();
  const { castVotes, isLoading } = useVotingActions({ charge, votesClose });

  const handleClose = () => {
    setShowAddFunds(false);
    onClose?.();
  };

  if (isChargeLoading) {
    return null;
  }

  return (
    <Drawer isOpen={isOpen} onClose={handleClose} className="bg-true-black w-full h-auto">
      <div className="flex flex-col gap-4 p-6">
        <PriceCurveWrapper showPriceWarning />
        <div className={`px-6 py-4 rounded-4xl ${showAddFunds ? "bg-primary-13" : "bg-gradient-voting-area-teal"}`}>
          {showAddFunds ? (
            <AddFunds
              chain={contestConfig.chainName}
              asset={contestConfig.chainNativeCurrencySymbol}
              onGoBack={() => setShowAddFunds(false)}
            />
          ) : (
            <VotingWidget
              costToVote={currentPricePerVote}
              costToVoteRaw={currentPricePerVoteRaw}
              submissionsCount={submissionsCount}
              isLoading={isLoading}
              isVotingClosed={!isVotingOpen}
              isContestCanceled={contestState === ContestStateEnum.Canceled}
              onVote={(amount: number) => castVotes(amount)}
              onAddFunds={() => setShowAddFunds(true)}
            />
          )}
        </div>
      </div>
    </Drawer>
  );
};

export default SubmissionPageMobileVoting;
