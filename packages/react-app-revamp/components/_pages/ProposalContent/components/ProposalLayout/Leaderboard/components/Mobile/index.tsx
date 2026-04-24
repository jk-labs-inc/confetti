import { Proposal } from "@components/_pages/ProposalContent";
import ProposalContentDeleteButton from "@components/_pages/ProposalContent/components/Buttons/Delete";
import ProposalContentVotePrimary from "@components/_pages/ProposalContent/components/Buttons/Vote/Primary";
import CustomLink from "@components/UI/Link";
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
  commentLink: string;
  allowDelete: boolean;
  selectedProposalIds: string[];
  chainName: string;
  contestAddress: string;
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
  chainName,
  contestAddress,
  isHighlighted,
}) => {
  const entryTitle = proposal.metadataFields.stringArray[0];
  const isVotingActive =
    contestStatus === ContestStatus.VotingOpen || contestStatus === ContestStatus.VotingClosed;
  const submissionUrl = `/contest/${chainName.toLowerCase()}/${contestAddress}/submission/${proposal.id}`;

  return (
    <div
      className={`min-w-0 grid ${
        isVotingActive ? "grid-cols-[1fr_64px_48px]" : allowDelete ? "grid-cols-[1fr_auto]" : "grid-cols-[1fr]"
      } items-center gap-4 py-3 border-b transition-colors duration-300 ease-in-out ${
        isHighlighted ? "border-secondary-14" : "border-neutral-4"
      }`}
    >
      <CustomLink
        href={submissionUrl}
        className="min-w-0 text-[16px] text-neutral-11 font-bold normal-case truncate hover:text-positive-11 transition-colors duration-300 ease-in-out"
      >
        {entryTitle}
      </CustomLink>
      {isVotingActive ? (
        <>
          <p className="text-[16px] text-neutral-11 font-bold tabular-nums">
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
  );
};

export default ProposalLayoutLeaderboardMobile;
