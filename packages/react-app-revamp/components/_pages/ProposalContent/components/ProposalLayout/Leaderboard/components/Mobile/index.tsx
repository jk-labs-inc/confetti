import { Proposal } from "@components/_pages/ProposalContent";
import ProposalContentDeleteButton from "@components/_pages/ProposalContent/components/Buttons/Delete";
import ProposalContentVotePrimary from "@components/_pages/ProposalContent/components/Buttons/Vote/Primary";
import { formatNumberWithCommas } from "@helpers/formatNumber";
import { ContestStatus } from "@hooks/useContestStatus/store";
import { FC } from "react";

interface ProposalLayoutLeaderboardMobileProps {
  proposal: Proposal;
  proposalAuthorData: {
    name: string;
    avatar: string;
    isLoading: boolean;
    isError: boolean;
  };
  contestStatus: ContestStatus;
  allowDelete: boolean;
  selectedProposalIds: string[];
  isHighlighted: boolean;
  toggleProposalSelection?: (proposalId: string) => void;
  handleVotingDrawerOpen?: () => void;
}

const ProposalLayoutLeaderboardMobile: FC<ProposalLayoutLeaderboardMobileProps> = ({
  proposal,
  contestStatus,
  allowDelete,
  selectedProposalIds,
  toggleProposalSelection,
  handleVotingDrawerOpen,
  isHighlighted,
}) => {
  const entryTitle = proposal.metadataFields.stringArray[0];
  const isVotingActive =
    contestStatus === ContestStatus.VotingOpen || contestStatus === ContestStatus.VotingClosed;

  return (
    <div className="relative">
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 -left-3 -right-3 rounded-lg border transition-opacity duration-200 ease-out ${
          isHighlighted ? "border-neutral-10 bg-primary-1 opacity-100" : "border-transparent opacity-0"
        }`}
      />
      <div
        className={`relative min-w-0 grid ${
          isVotingActive ? "grid-cols-[1fr_64px_48px]" : allowDelete ? "grid-cols-[1fr_auto]" : "grid-cols-[1fr]"
        } items-center gap-4 py-3 border-b transition-colors duration-200 ease-out ${
          isHighlighted ? "border-transparent" : "border-neutral-4"
        }`}
      >
        <p className="min-w-0 text-[16px] text-neutral-11 normal-case truncate">{entryTitle}</p>
        {isVotingActive ? (
          <>
            <p className="text-[16px] text-neutral-11 tabular-nums">
              {formatNumberWithCommas(proposal.votes)}
            </p>
            <div className="flex justify-end">
              <ProposalContentVotePrimary proposal={proposal} handleVotingModalOpen={handleVotingDrawerOpen} />
            </div>
          </>
        ) : (
          allowDelete && (
            <div className="flex justify-end">
              <ProposalContentDeleteButton
                proposalId={proposal.id}
                selectedProposalIds={selectedProposalIds}
                toggleProposalSelection={toggleProposalSelection}
                inline
              />
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ProposalLayoutLeaderboardMobile;
