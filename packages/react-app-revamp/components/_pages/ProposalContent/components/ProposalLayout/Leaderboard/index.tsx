import { Proposal } from "@components/_pages/ProposalContent";
import CustomLink from "@components/UI/Link";
import { formatNumberWithCommas } from "@helpers/formatNumber";
import { ContestStatus } from "@hooks/useContestStatus/store";
import { FC } from "react";
import ProposalContentDeleteButton from "../../Buttons/Delete";
import ProposalContentVotePrimary from "../../Buttons/Vote/Primary";
import ProposalLayoutLeaderboardMobile from "./components/Mobile";
import ProposalLayoutLeaderboardRankOrPlaceholder from "./components/RankOrPlaceholder";

interface ProposalLayoutLeaderboardProps {
  proposal: Proposal;
  proposalAuthorData: {
    name: string;
    avatar: string;
    isLoading: boolean;
    isError: boolean;
  };
  isMobile: boolean;
  chainName: string;
  contestAddress: string;
  contestStatus: ContestStatus;
  formattedVotingOpen: moment.Moment;
  commentLink: string;
  allowDelete: boolean;
  selectedProposalIds: string[];
  isHighlighted: boolean;
  handleVotingDrawerOpen?: () => void;
  toggleProposalSelection?: (proposalId: string) => void;
}

const ProposalLayoutLeaderboard: FC<ProposalLayoutLeaderboardProps> = ({
  proposal,
  proposalAuthorData,
  isMobile,
  chainName,
  contestAddress,
  contestStatus,
  formattedVotingOpen,
  commentLink,
  allowDelete,
  selectedProposalIds,
  isHighlighted,
  handleVotingDrawerOpen,
  toggleProposalSelection,
}) => {
  const entryTitle = proposal.metadataFields.stringArray[0];
  const isVotingActive =
    contestStatus === ContestStatus.VotingOpen || contestStatus === ContestStatus.VotingClosed;
  const submissionUrl = `/contest/${chainName.toLowerCase()}/${contestAddress}/submission/${proposal.id}`;

  if (isMobile) {
    return (
      <ProposalLayoutLeaderboardMobile
        proposal={proposal}
        proposalAuthorData={proposalAuthorData}
        contestStatus={contestStatus}
        commentLink={commentLink}
        allowDelete={allowDelete}
        selectedProposalIds={selectedProposalIds}
        toggleProposalSelection={toggleProposalSelection}
        handleVotingDrawerOpen={handleVotingDrawerOpen}
        chainName={chainName}
        contestAddress={contestAddress}
        isHighlighted={isHighlighted}
      />
    );
  }

  return (
    <div className="relative">
      {isVotingActive && (
        <div className="hidden md:block absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 -ml-6">
          <ProposalLayoutLeaderboardRankOrPlaceholder proposal={proposal} contestStatus={contestStatus} />
        </div>
      )}
      <div
        className={`min-w-0 grid ${
          isVotingActive ? "grid-cols-[1fr_120px_80px]" : allowDelete ? "grid-cols-[1fr_auto]" : "grid-cols-[1fr]"
        } items-center gap-6 py-4 border-b transition-colors duration-300 ease-in-out ${
          isHighlighted ? "border-secondary-14" : "border-neutral-4"
        }`}
      >
        <CustomLink
          scroll={false}
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
    </div>
  );
};

export default ProposalLayoutLeaderboard;
