import AddFunds from "@components/AddFunds";
import VotingWidget from "@components/Voting";
import EntryPreviewHeader, { EntryPreviewHeaderProps } from "@components/Voting/components/EntryPreviewHeader";
import { useVotingStore } from "@components/Voting/store";
import useCastVotes from "@hooks/useCastVotes";
import { useCastVotesStore } from "@hooks/useCastVotes/store";
import useContestConfigStore from "@hooks/useContestConfig/store";
import useCurrentPricePerVote from "@hooks/useCurrentPricePerVote";
import { Charge } from "@hooks/useDeployContest/types";
import { FC, useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";
import VoteFlowShell, { VoteFlowPresentation } from "./components/Shell";

interface VoteFlowProps {
  isOpen: boolean;
  onClose: () => void;
  charge: Charge;
  votesClose: Date;
  isVotingClosed: boolean;
  isContestCanceled: boolean;
  submissionsCount: number;
  presentation?: VoteFlowPresentation;
  entryPreview?: EntryPreviewHeaderProps;
  resetInputOnOpen?: boolean;
  onVoteSuccess?: (result: { proposalId: string; amountOfVotes: number }) => void;
}

const VoteFlow: FC<VoteFlowProps> = ({
  isOpen,
  onClose,
  charge,
  votesClose,
  isVotingClosed,
  isContestCanceled,
  submissionsCount,
  presentation,
  entryPreview,
  resetInputOnOpen = false,
  onVoteSuccess,
}) => {
  const { contestConfig } = useContestConfigStore(useShallow(state => state));
  const pickedProposal = useCastVotesStore(state => state.pickedProposal);
  const resetVotingInput = useVotingStore(state => state.reset);
  const { castVotes, isLoading } = useCastVotes({ charge, votesClose });
  const [showAddFunds, setShowAddFunds] = useState(false);
  const {
    currentPricePerVote,
    currentPricePerVoteRaw,
    isLoading: isCurrentPricePerVoteLoading,
  } = useCurrentPricePerVote({
    address: contestConfig.address,
    abi: contestConfig.abi,
    chainId: contestConfig.chainId,
    votingClose: votesClose,
  });

  useEffect(() => {
    if (isOpen && resetInputOnOpen) resetVotingInput();
  }, [isOpen, resetInputOnOpen, resetVotingInput]);

  const handleClose = () => {
    onClose();
    setShowAddFunds(false);
  };

  const onVote = async (amount: number) => {
    try {
      await castVotes(amount);
      if (pickedProposal) onVoteSuccess?.({ proposalId: pickedProposal, amountOfVotes: amount });
      handleClose();
    } catch {
      handleClose();
    }
  };

  const onAddFunds = () => {
    setShowAddFunds(true);
  };

  return (
    <VoteFlowShell isOpen={isOpen} onClose={handleClose} presentation={presentation}>
      {showAddFunds ? (
        <div className="animate-appear">
          <AddFunds
            chain={contestConfig.chainName}
            asset={contestConfig.chainNativeCurrencySymbol ?? ""}
            onGoBack={() => setShowAddFunds(false)}
          />
        </div>
      ) : (
        <>
          {entryPreview && <EntryPreviewHeader {...entryPreview} />}
          <VotingWidget
            costToVote={currentPricePerVote}
            costToVoteRaw={currentPricePerVoteRaw}
            isLoading={isCurrentPricePerVoteLoading || isLoading}
            isVotingClosed={isVotingClosed}
            isContestCanceled={isContestCanceled}
            onVote={onVote}
            onAddFunds={onAddFunds}
            submissionsCount={submissionsCount}
          />
        </>
      )}
    </VoteFlowShell>
  );
};

export default VoteFlow;
