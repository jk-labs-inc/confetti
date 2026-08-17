import AddFunds from "@components/AddFunds";
import VotingWidget from "@components/Voting";
import EntryPreviewHeader, { EntryPreviewHeaderProps } from "@components/Voting/components/EntryPreviewHeader";
import { usePickedEntryPreview } from "@components/Voting/hooks/usePickedEntryPreview";
import { useVotingStore } from "@components/Voting/store";
import { VoteFlowScreen } from "@components/Voting/types";
import useCastVotes from "@hooks/useCastVotes";
import { useCastVotesStore } from "@hooks/useCastVotes/store";
import useContestConfigStore from "@hooks/useContestConfig/store";
import useCurrentPricePerVote from "@hooks/useCurrentPricePerVote";
import { Charge } from "@hooks/useDeployContest/types";
import { FC, useEffect } from "react";
import { useShallow } from "zustand/shallow";
import ConfirmVote from "./components/ConfirmVote";
import VoteFlowShell, { VoteFlowPresentation } from "./components/Shell";
import { useVoteFlowController } from "./hooks/useVoteFlowController";

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
  const { currentPricePerVote, isLoading: isCurrentPricePerVoteLoading } = useCurrentPricePerVote({
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

  const {
    screen,
    effectiveCostToVote,
    goToVote,
    goToAddFunds,
    requestConnectAndVote,
    confirmVote,
    handleBridgeSuccess,
  } = useVoteFlowController({
    isOpen,
    costToVote: currentPricePerVote,
    isVotingClosed,
    isContestCanceled,
    onVote,
  });
  const fallbackEntryPreview = usePickedEntryPreview();
  const resolvedEntryPreview = entryPreview ?? fallbackEntryPreview;

  return (
    <VoteFlowShell isOpen={isOpen} onClose={handleClose} presentation={presentation}>
      {screen === VoteFlowScreen.AddFunds ? (
        <div className="animate-appear">
          <AddFunds
            chain={contestConfig.chainName}
            asset={contestConfig.chainNativeCurrencySymbol ?? ""}
            onGoBack={goToVote}
            onBridgeSuccess={handleBridgeSuccess}
          />
        </div>
      ) : screen === VoteFlowScreen.Confirm ? (
        <div className="animate-appear">
          <ConfirmVote
            entryPreview={resolvedEntryPreview}
            chainNativeCurrencySymbol={contestConfig.chainNativeCurrencySymbol ?? ""}
            costToVote={effectiveCostToVote}
            isVotingClosed={isVotingClosed}
            isVoteLoading={isLoading}
            onConfirm={confirmVote}
            onGoBack={goToVote}
          />
        </div>
      ) : (
        <>
          {entryPreview && <EntryPreviewHeader {...entryPreview} />}
          <VotingWidget
            costToVote={currentPricePerVote}
            isLoading={isCurrentPricePerVoteLoading || isLoading}
            isVotingClosed={isVotingClosed}
            isContestCanceled={isContestCanceled}
            onVote={onVote}
            onAddFunds={goToAddFunds}
            onConnectRequest={requestConnectAndVote}
            submissionsCount={submissionsCount}
          />
        </>
      )}
    </VoteFlowShell>
  );
};

export default VoteFlow;
