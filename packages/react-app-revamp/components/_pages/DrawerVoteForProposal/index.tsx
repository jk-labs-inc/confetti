import VoteFlow from "@components/Voting/VoteFlow";
import { VoteFlowPresentation } from "@components/Voting/VoteFlow/components/Shell";
import { useContestStore } from "@hooks/useContest/store";
import { ContestStateEnum, useContestStateStore } from "@hooks/useContestState/store";
import { ContestStatus, useContestStatusStore } from "@hooks/useContestStatus/store";
import { useProposalStore } from "@hooks/useProposal/store";
import { FC } from "react";
import { useShallow } from "zustand/shallow";

interface DrawerVoteForProposalProps {
  isOpen: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}

export const DrawerVoteForProposal: FC<DrawerVoteForProposalProps> = ({ isOpen, setIsOpen }) => {
  const { charge, votingClose } = useContestStore(
    useShallow(state => ({
      charge: state.charge,
      votingClose: state.votesClose,
    })),
  );
  const submissionsCount = useProposalStore(useShallow(state => state.submissionsCount));
  const contestStatus = useContestStatusStore(useShallow(state => state.contestStatus));
  const contestState = useContestStateStore(useShallow(state => state.contestState));

  return (
    <VoteFlow
      isOpen={isOpen}
      onClose={() => setIsOpen?.(false)}
      charge={charge}
      votesClose={votingClose}
      isVotingClosed={contestStatus === ContestStatus.VotingClosed}
      isContestCanceled={contestState === ContestStateEnum.Canceled}
      submissionsCount={submissionsCount}
      presentation={VoteFlowPresentation.Drawer}
    />
  );
};

export default DrawerVoteForProposal;
