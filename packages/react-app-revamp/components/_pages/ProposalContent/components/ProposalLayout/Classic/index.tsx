import { Proposal } from "@components/_pages/ProposalContent";
import VoteCountPulse from "@components/_pages/ProposalContent/components/VoteFeedback";
import {
  clearStorageIfNeeded,
  ContestVisibilities,
  HIDDEN_PROPOSALS_STORAGE_KEY,
  toggleContentVisibility,
} from "@components/_pages/ProposalContent/utils/contestVisibility";
import { transform } from "@components/_pages/ProposalContent/utils/markdown";
import { formatNumberWithCommas } from "@helpers/formatNumber";
import { loadFromLocalStorage } from "@helpers/localStorage";
import { ContestStatus } from "@hooks/useContestStatus/store";
import { Interweave } from "interweave";
import { useEffect, useState } from "react";
import ProposalContentDeleteButton from "../../Buttons/Delete";
import ProposalContentInfo from "../../ProposalContentInfo";

interface ProposalLayoutClassicProps {
  proposal: Proposal;
  isMobile: boolean;
  contestAddress: string;
  contestStatus: ContestStatus;
  allowDelete: boolean;
  selectedProposalIds: string[];
  isHighlighted: boolean;
  handleVotingDrawerOpen?: () => void;
  toggleProposalSelection?: (proposalId: string) => void;
}

const ProposalLayoutClassic = ({
  proposal,
  isMobile,
  contestAddress,
  contestStatus,
  allowDelete,
  selectedProposalIds,
  isHighlighted,
  handleVotingDrawerOpen,
  toggleProposalSelection,
}: ProposalLayoutClassicProps) => {
  const [isContentHidden, setIsContentHidden] = useState(false);

  useEffect(() => {
    clearStorageIfNeeded();

    const visibilityState = loadFromLocalStorage<ContestVisibilities>(HIDDEN_PROPOSALS_STORAGE_KEY, {});
    const hiddenProposals = visibilityState[contestAddress] || [];

    setIsContentHidden(hiddenProposals.includes(proposal.id));
  }, [contestAddress, proposal.id]);

  const handleToggleVisibility = () => {
    const newVisibility = toggleContentVisibility(contestAddress, proposal.id, isContentHidden);
    setIsContentHidden(newVisibility);
  };
  return (
    <div className="flex flex-col gap-4 pb-4 border-b border-primary-2 animate-fade-in">
      <ProposalContentInfo
        authorAddress={proposal.authorEthereumAddress}
        rank={proposal.rank}
        isTied={proposal.isTied}
        isMobile={isMobile}
        isContentHidden={isContentHidden}
        toggleContentVisibility={handleToggleVisibility}
      />
      {!isContentHidden && (
        <div className="md:mx-8 flex flex-col gap-4">
          <div className="flex w-full">
            <div
              className={`inline-block p-4 rounded-[8px] bg-primary-1 border transition-colors duration-300 ease-in-out overflow-hidden ${
                isHighlighted ? "border-secondary-14" : "border-transparent"
              }`}
            >
              <div className="max-w-full overflow-hidden interweave-container">
                <Interweave
                  className="prose prose-invert interweave-container inline-block w-full"
                  content={proposal.content}
                  transform={transform}
                  tagName="div"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex gap-2 items-center">
              {contestStatus === ContestStatus.VotingOpen || contestStatus === ContestStatus.VotingClosed ? (
                <button
                  onClick={handleVotingDrawerOpen}
                  className="xl:hidden min-w-36 shrink-0 h-10 p-2 flex items-center justify-between gap-2 bg-primary-1 rounded-[16px] cursor-pointer border border-transparent hover:border-positive-11 transition-colors duration-300 ease-in-out"
                >
                  <img src="/contest/upvote.svg" width={21.56} height={20.44} alt="upvote" className="shrink-0" />
                  <p className="text-[16px] text-positive-11 font-bold grow text-center">
                    <VoteCountPulse votes={proposal.votes}>{formatNumberWithCommas(proposal.votes)}</VoteCountPulse> vote
                    {proposal.votes !== 1 ? "s" : ""}
                  </p>
                </button>
              ) : null}
            </div>
            {allowDelete && (
              <ProposalContentDeleteButton
                proposalId={proposal.id}
                selectedProposalIds={selectedProposalIds}
                toggleProposalSelection={toggleProposalSelection}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalLayoutClassic;
