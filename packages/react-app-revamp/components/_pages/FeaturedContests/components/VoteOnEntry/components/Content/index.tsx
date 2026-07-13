import { EntryPreviewHeaderProps } from "@components/Voting/components/EntryPreviewHeader";
import VoteFlow from "@components/Voting/VoteFlow";
import VoteFlowShell from "@components/Voting/VoteFlow/components/Shell";
import { useCastVotesStore } from "@hooks/useCastVotes/store";
import useCharge from "@hooks/useCharge";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { FC, useEffect } from "react";
import Skeleton from "react-loading-skeleton";
import { useShallow } from "zustand/shallow";

interface VoteOnEntryContentProps {
  proposalId: string;
  entryPreview: EntryPreviewHeaderProps;
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
  submissionsCount,
  votesClose,
  isCanceled,
  isOpen,
  onClose,
  onVoteSuccess,
}) => {
  const { contestConfig } = useContestConfigStore(useShallow(state => state));
  const setPickedProposal = useCastVotesStore(state => state.setPickedProposal);
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

  const isVotingClosed = new Date() >= votesClose;

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
