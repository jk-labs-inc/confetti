import { useVotingActions } from "@components/_pages/Submission/hooks/useVotingActions";
import { useVotingSetup } from "@components/_pages/Submission/hooks/useVotingSetup";
import { useSubmissionPageStore } from "@components/_pages/Submission/store";
import AddFunds from "@components/AddFunds";
import VotingWidget, { VotingWidgetStyle } from "@components/Voting";
import { ContestStateEnum } from "@hooks/useContestState/store";
import { Charge } from "@hooks/useDeployContest/types";
import { useWallet } from "@hooks/useWallet";
import { FC, useState, useCallback } from "react";
import { useShallow } from "zustand/shallow";

interface SubmissionPageDesktopVotingAreaWidgetHandlerProps {
  charge: Charge;
  votesClose: Date;
}

const SubmissionPageDesktopVotingAreaWidgetHandler: FC<SubmissionPageDesktopVotingAreaWidgetHandlerProps> = ({
  charge,
  votesClose,
}) => {
  const { userAddress } = useWallet();
  const submissionsCount = useSubmissionPageStore(useShallow(state => state.allProposalIds.length));
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const { contestConfig, contestDetails, currentPricePerVote, currentPricePerVoteRaw, isVotingOpen } = useVotingSetup(
    votesClose,
    userAddress,
  );
  const { castVotes, isLoading } = useVotingActions({ charge, votesClose });

  const onVote = useCallback(
    (amount: number) => {
      castVotes(amount);
    },
    [castVotes],
  );

  const onAddFunds = useCallback(() => setShowAddFundsModal(true), []);

  return (
    <div className="relative">
      <div className={`px-6 py-4 rounded-4xl ${showAddFundsModal ? "bg-primary-13" : "bg-gradient-voting-area-teal"}`}>
        {showAddFundsModal ? (
          <AddFunds
            chain={contestConfig.chainName}
            asset={contestConfig.chainNativeCurrencySymbol}
            onGoBack={() => setShowAddFundsModal(false)}
          />
        ) : (
          <VotingWidget
            costToVote={currentPricePerVote}
            costToVoteRaw={currentPricePerVoteRaw}
            style={VotingWidgetStyle.colored}
            isLoading={isLoading}
            isVotingClosed={!isVotingOpen}
            isContestCanceled={contestDetails.state === ContestStateEnum.Canceled}
            submissionsCount={submissionsCount}
            onAddFunds={onAddFunds}
            onVote={onVote}
          />
        )}
      </div>
    </div>
  );
};

export default SubmissionPageDesktopVotingAreaWidgetHandler;
