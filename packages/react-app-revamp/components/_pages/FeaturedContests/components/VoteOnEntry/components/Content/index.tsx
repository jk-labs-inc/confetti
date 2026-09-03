import { EntryPreviewHeaderProps } from "@components/Voting/components/EntryPreviewHeader";
import VoteFlow from "@components/Voting/VoteFlow";
import VoteFlowShell, { useVoteFlowPresentation } from "@components/Voting/VoteFlow/components/Shell";
import VotingActionBar from "@components/VotingActionBar";
import { useCastVotesStore } from "@hooks/useCastVotes/store";
import useCharge from "@hooks/useCharge";
import { useContestStore } from "@hooks/useContest/store";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { ContestEntryVotes } from "@hooks/useContestEntriesVotes";
import { useProposalStore } from "@hooks/useProposal/store";
import { FC, useEffect } from "react";
import Skeleton from "react-loading-skeleton";
import { useShallow } from "zustand/shallow";

interface VoteOnEntryContentProps {
  proposalId: string;
  entryPreview: EntryPreviewHeaderProps;
  entryVotes?: ContestEntryVotes[];
  submissionsCount: number;
  votesClose: Date;
  isCanceled: boolean;
  isOpen: boolean;
  onClose: () => void;
  onVoteSuccess?: (result: { proposalId: string; amountOfVotes: number }) => void;
}

const VoteOnEntryContent: FC<VoteOnEntryContentProps> = ({
  proposalId,
  entryPreview,
  entryVotes,
  submissionsCount,
  votesClose,
  isCanceled,
  isOpen,
  onClose,
  onVoteSuccess,
}) => {
  const { contestConfig } = useContestConfigStore(useShallow(state => state));
  const setPickedProposal = useCastVotesStore(state => state.setPickedProposal);
  const { setInitialMappedProposalIds, setSubmissionsCount } = useProposalStore(
    useShallow(state => ({
      setInitialMappedProposalIds: state.setInitialMappedProposalIds,
      setSubmissionsCount: state.setSubmissionsCount,
    })),
  );
  const { setCharge, setVotesClose } = useContestStore(
    useShallow(state => ({ setCharge: state.setCharge, setVotesClose: state.setVotesClose })),
  );
  const { usesDrawer } = useVoteFlowPresentation();
  const { charge, isLoading: isChargeLoading } = useCharge({
    address: contestConfig.address,
    abi: contestConfig.abi,
    chainId: contestConfig.chainId,
    version: contestConfig.version,
  });

  // castVotes reads the target entry from the store, same as the contest page's drawer flow.
  useEffect(() => {
    setPickedProposal(isOpen ? proposalId : null);
  }, [isOpen, proposalId, setPickedProposal]);

  useEffect(() => {
    if (!entryVotes) return;
    setInitialMappedProposalIds(entryVotes.map(({ id, votes }) => ({ id, votes: votes ?? 0 })));
  }, [entryVotes, setInitialMappedProposalIds]);

  useEffect(() => {
    if (charge) setCharge(charge);
  }, [charge, setCharge]);

  useEffect(() => {
    setVotesClose(votesClose);
  }, [votesClose, setVotesClose]);

  useEffect(() => {
    setSubmissionsCount(submissionsCount);
  }, [submissionsCount, setSubmissionsCount]);

  const isVotingClosed = new Date() >= votesClose;

  if (usesDrawer) {
    if (!isOpen || isCanceled) return null;

    return (
      <VotingActionBar
        entryPreview={entryPreview}
        isVotingClosed={isVotingClosed}
        onClose={onClose}
        onVoteSuccess={onVoteSuccess}
      />
    );
  }

  if (isChargeLoading) {
    return (
      <VoteFlowShell isOpen={isOpen} onClose={onClose}>
        <Skeleton baseColor="#212121" highlightColor="#100816" borderRadius={10} height={160} />
      </VoteFlowShell>
    );
  }

  return (
    <VoteFlow
      isOpen={isOpen}
      onClose={onClose}
      charge={charge}
      votesClose={votesClose}
      isVotingClosed={isVotingClosed}
      isContestCanceled={isCanceled}
      submissionsCount={submissionsCount}
      entryPreview={entryPreview}
      resetInputOnOpen
      onVoteSuccess={onVoteSuccess}
    />
  );
};

export default VoteOnEntryContent;
