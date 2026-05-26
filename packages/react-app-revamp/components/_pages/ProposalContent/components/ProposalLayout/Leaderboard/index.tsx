import { Proposal } from "@components/_pages/ProposalContent";
import { formatNumberWithCommas } from "@helpers/formatNumber";
import { ContestStatus } from "@hooks/useContestStatus/store";
import { useProposalStore } from "@hooks/useProposal/store";
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
  contestStatus: ContestStatus;
  formattedVotingOpen: moment.Moment;
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
  contestStatus,
  allowDelete,
  selectedProposalIds,
  isHighlighted,
  handleVotingDrawerOpen,
  toggleProposalSelection,
}) => {
  const entryTitle = proposal.metadataFields.stringArray[0];
  const isVotingActive =
    contestStatus === ContestStatus.VotingOpen || contestStatus === ContestStatus.VotingClosed;
  const initialMappedProposalIds = useProposalStore(state => state.initialMappedProposalIds);
  const totalVotes = initialMappedProposalIds.reduce((sum, p) => sum + p.votes, 0);
  const votePercentage = totalVotes > 0 ? Math.round((proposal.votes / totalVotes) * 100) : 0;

  if (isMobile) {
    return (
      <ProposalLayoutLeaderboardMobile
        proposal={proposal}
        proposalAuthorData={proposalAuthorData}
        contestStatus={contestStatus}
        allowDelete={allowDelete}
        selectedProposalIds={selectedProposalIds}
        toggleProposalSelection={toggleProposalSelection}
        handleVotingDrawerOpen={handleVotingDrawerOpen}
        isHighlighted={isHighlighted}
      />
    );
  }

  return (
    <div className="relative">
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 ${
          isVotingActive ? "-left-20" : "-left-3"
        } -right-4 rounded-lg border transition-opacity duration-200 ease-out ${
          isHighlighted ? "border-neutral-10 bg-primary-1 opacity-100" : "border-transparent opacity-0"
        }`}
      />
      {isVotingActive && (
        <div className="hidden md:block absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 -ml-6">
          <ProposalLayoutLeaderboardRankOrPlaceholder proposal={proposal} contestStatus={contestStatus} />
        </div>
      )}
      <div
        className={`relative min-w-0 grid ${
          isVotingActive
            ? "grid-cols-[1fr_120px_80px_80px] xl:grid-cols-[1fr_120px_80px]"
            : allowDelete
              ? "grid-cols-[1fr_auto]"
              : "grid-cols-[1fr]"
        } items-center gap-6 py-4 border-b transition-colors duration-200 ease-out ${
          isHighlighted ? "border-transparent" : "border-neutral-4"
        }`}
      >
        <p className="min-w-0 text-[16px] text-neutral-11 normal-case truncate">{entryTitle}</p>
        {isVotingActive ? (
          <>
            <p className="text-[16px] text-neutral-11 tabular-nums">
              {formatNumberWithCommas(proposal.votes)}
            </p>
            <p className="text-[24px] text-neutral-11 tabular-nums">{votePercentage}%</p>
            <div className="xl:hidden flex justify-end">
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
