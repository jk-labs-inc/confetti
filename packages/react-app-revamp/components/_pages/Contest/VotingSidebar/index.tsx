import AddFunds from "@components/AddFunds";
import InlineTransactionOverlay from "@components/UI/TransactionOverlay/Inline";
import { isInlineOverlayInFlow, useTransactionOverlayStore } from "@components/UI/TransactionOverlay/store";
import { useRunAfterOverlayDismissed } from "@components/UI/TransactionOverlay/useRunAfterOverlayDismissed";
import VotingWidget, { VotingWidgetStyle } from "@components/Voting";
import EntryPreviewHeader from "@components/Voting/components/EntryPreviewHeader";
import { usePickedEntryPreview } from "@components/Voting/hooks/usePickedEntryPreview";
import { VoteFlowScreen } from "@components/Voting/types";
import ConfirmVote from "@components/Voting/VoteFlow/components/ConfirmVote";
import { useVoteFlowController } from "@components/Voting/VoteFlow/hooks/useVoteFlowController";
import VotingSidebarVoters from "./components/Voters";
import useCastVotes from "@hooks/useCastVotes";
import { useCastVotesStore } from "@hooks/useCastVotes/store";
import { useContestStore } from "@hooks/useContest/store";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { ContestStateEnum, useContestStateStore } from "@hooks/useContestState/store";
import { ContestStatus, useContestStatusStore } from "@hooks/useContestStatus/store";
import useCurrentPricePerVote from "@hooks/useCurrentPricePerVote";
import { useProposalStore } from "@hooks/useProposal/store";
import { FC, useEffect } from "react";
import { useShallow } from "zustand/shallow";
import { useAutoPickFirstProposal } from "./useAutoPickFirstProposal";

const VotingSidebar: FC = () => {
  useAutoPickFirstProposal();
  const { contestConfig } = useContestConfigStore(useShallow(state => state));
  const { charge: contestCharge, votingClose } = useContestStore(
    useShallow(state => ({
      charge: state.charge,
      votingClose: state.votesClose,
    })),
  );
  const submissionsCount = useProposalStore(state => state.submissionsCount);
  const entryPreview = usePickedEntryPreview();
  const { image, title, contestName } = entryPreview;
  const contestStatus = useContestStatusStore(useShallow(state => state.contestStatus));
  const contestState = useContestStateStore(useShallow(state => state.contestState));
  const isContestCanceled = contestState === ContestStateEnum.Canceled;
  const isVotingOpen = contestStatus === ContestStatus.VotingOpen;
  const isVotingClosed = contestStatus === ContestStatus.VotingClosed;
  const pickedProposal = useCastVotesStore(state => state.pickedProposal);
  const { castVotes, isLoading } = useCastVotes({
    charge: contestCharge,
    votesClose: votingClose,
    inlineOverlay: true,
  });
  const { currentPricePerVote, isLoading: isCurrentPricePerVoteLoading } = useCurrentPricePerVote({
    address: contestConfig.address,
    abi: contestConfig.abi,
    chainId: contestConfig.chainId,
    votingClose,
    enabled: isVotingOpen,
  });

  const runAfterOverlayDismissed = useRunAfterOverlayDismissed();
  const hidesVotingArea = useTransactionOverlayStore(isInlineOverlayInFlow);

  const onVote = async (amount: number) => {
    try {
      await castVotes(amount);
    } catch {
    } finally {
      runAfterOverlayDismissed(goToVote);
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
    isOpen: true,
    costToVote: currentPricePerVote,
    isVotingClosed: false,
    isContestCanceled,
    onVote,
  });

  useEffect(() => {
    goToVote();
  }, [pickedProposal, goToVote]);

  if (isContestCanceled || (!isVotingOpen && !isVotingClosed) || !pickedProposal) return null;

  return (
    <div className="bg-primary-1 rounded-4xl p-4 flex flex-col gap-4">
      {isVotingOpen && (
        <div
          className={`relative px-6 py-4 rounded-4xl flex flex-col gap-4 ${screen === VoteFlowScreen.AddFunds ? "bg-primary-13" : "bg-gradient-voting-area-purple"}`}
        >
          {screen === VoteFlowScreen.Vote && !hidesVotingArea && (
            <EntryPreviewHeader image={image} title={title} contestName={contestName} />
          )}

          {hidesVotingArea ? null : screen === VoteFlowScreen.AddFunds ? (
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
                entryPreview={entryPreview}
                chainNativeCurrencySymbol={contestConfig.chainNativeCurrencySymbol ?? ""}
                costToVote={effectiveCostToVote}
                isVotingClosed={false}
                isVoteLoading={isLoading}
                onConfirm={confirmVote}
                onGoBack={goToVote}
              />
            </div>
          ) : (
            <VotingWidget
              key={pickedProposal}
              costToVote={currentPricePerVote}
              style={VotingWidgetStyle.colored}
              isLoading={isCurrentPricePerVoteLoading || isLoading}
              isVotingClosed={false}
              isContestCanceled={isContestCanceled}
              onVote={onVote}
              onAddFunds={goToAddFunds}
              onConnectRequest={requestConnectAndVote}
              submissionsCount={submissionsCount}
            />
          )}

          <InlineTransactionOverlay className="rounded-4xl" inFlowClassName="-mx-6 -my-4" />
        </div>
      )}

      {screen === VoteFlowScreen.Vote && (
        <VotingSidebarVoters
          key={pickedProposal}
          proposalId={pickedProposal}
          image={image}
          title={title}
          contestName={contestName}
        />
      )}
    </div>
  );
};

export default VotingSidebar;
