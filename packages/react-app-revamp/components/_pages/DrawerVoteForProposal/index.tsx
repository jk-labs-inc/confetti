import AddFunds from "@components/AddFunds";
import Drawer from "@components/UI/Drawer";
import VotingWidget from "@components/Voting";
import useCastVotes from "@hooks/useCastVotes";
import { useContestStore } from "@hooks/useContest/store";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { ContestStateEnum, useContestStateStore } from "@hooks/useContestState/store";
import { ContestStatus, useContestStatusStore } from "@hooks/useContestStatus/store";
import useCurrentPricePerVote from "@hooks/useCurrentPricePerVote";
import { useProposalStore } from "@hooks/useProposal/store";
import { FC, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { useShallow } from "zustand/shallow";

interface DrawerVoteForProposalProps {
  isOpen: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}

export const DrawerVoteForProposal: FC<DrawerVoteForProposalProps> = ({ isOpen, setIsOpen }) => {
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const { contestConfig } = useContestConfigStore(useShallow(state => state));
  const { charge: contestCharge, votingClose } = useContestStore(
    useShallow(state => ({
      charge: state.charge,
      votingClose: state.votesClose,
    })),
  );
  const submissionsCount = useProposalStore(useShallow(state => state.submissionsCount));
  const contestStatus = useContestStatusStore(useShallow(state => state.contestStatus));
  const contestState = useContestStateStore(useShallow(state => state.contestState));
  const { castVotes, isLoading } = useCastVotes({ charge: contestCharge, votesClose: votingClose });
  const [showAddFunds, setShowAddFunds] = useState(false);
  const {
    currentPricePerVote,
    currentPricePerVoteRaw,
    isLoading: isCurrentPricePerVoteLoading,
  } = useCurrentPricePerVote({
    address: contestConfig.address,
    abi: contestConfig.abi,
    chainId: contestConfig.chainId,
    votingClose,
  });

  const onVote = async (amount: number) => {
    try {
      await castVotes(amount);
      handleDrawerClose();
    } catch {
      handleDrawerClose();
    }
  };

  const onAddFunds = () => {
    setShowAddFunds(true);
  };

  const handleDrawerClose = () => {
    setIsOpen?.(false);
    setShowAddFunds(false);
  };

  return (
    <Drawer
      isHandleHidden={!isMobile}
      isOpen={isOpen}
      onClose={handleDrawerClose}
      className="bg-true-black w-full h-auto md:max-w-[550px] m-auto"
    >
      <div className="flex flex-col gap-4 p-6 md:p-8">
        {showAddFunds ? (
          <div className="animate-appear">
            <AddFunds
              chain={contestConfig.chainName}
              asset={contestConfig.chainNativeCurrencySymbol ?? ""}
              onGoBack={() => setShowAddFunds(false)}
            />
          </div>
        ) : (
          <VotingWidget
            costToVote={currentPricePerVote}
            costToVoteRaw={currentPricePerVoteRaw}
            isLoading={isCurrentPricePerVoteLoading || isLoading}
            isVotingClosed={contestStatus === ContestStatus.VotingClosed}
            isContestCanceled={contestState === ContestStateEnum.Canceled}
            onVote={onVote}
            onAddFunds={onAddFunds}
            submissionsCount={submissionsCount}
          />
        )}
      </div>
    </Drawer>
  );
};

export default DrawerVoteForProposal;
