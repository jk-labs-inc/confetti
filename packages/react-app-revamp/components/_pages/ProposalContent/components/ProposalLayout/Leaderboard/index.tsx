import { Proposal } from "@components/_pages/ProposalContent";
import VoteCountPulse from "@components/_pages/ProposalContent/components/VoteFeedback";
import { formatNumberWithCommas } from "@helpers/formatNumber";
import { ContestStatus } from "@hooks/useContestStatus/store";
import { useProposalStore } from "@hooks/useProposal/store";
import { FC } from "react";
import ProposalContentDeleteButton from "../../Buttons/Delete";
import ProposalContentVotePrimary from "../../Buttons/Vote/Primary";
import WinnerBadge from "../../WinnerCelebration/WinnerBadge";
import ProposalLayoutLeaderboardMobile from "./components/Mobile";
import ProposalLayoutLeaderboardRankOrPlaceholder from "./components/RankOrPlaceholder";
import {
  CONTAINED_ROW_INSET_CLASS_NAME,
  RANKED_VOTING_GRID_CLASS_NAME,
  useLeaderboardTableLayout,
} from "./useLeaderboardTableLayout";

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
  allowDelete: boolean;
  selectedProposalIds: string[];
  isHighlighted: boolean;
  isWinner?: boolean;
  handleVotingDrawerOpen?: () => void;
  toggleProposalSelection?: (proposalId: string) => void;
}

const WINNER_ROW_CLASS_NAME = "border-[#ffe25b]/45 bg-[#ffe25b]/[0.06] opacity-100";

const ProposalLayoutLeaderboard: FC<ProposalLayoutLeaderboardProps> = ({
  proposal,
  proposalAuthorData,
  isMobile,
  contestStatus,
  allowDelete,
  selectedProposalIds,
  isHighlighted,
  isWinner = false,
  handleVotingDrawerOpen,
  toggleProposalSelection,
}) => {
  const entryTitle = proposal.metadataFields.stringArray[0];
  const isVotingActive = contestStatus === ContestStatus.VotingOpen || contestStatus === ContestStatus.VotingClosed;
  const hasRank = Boolean(proposal.rank);
  const initialMappedProposalIds = useProposalStore(state => state.initialMappedProposalIds);
  const totalVotes = initialMappedProposalIds.reduce((sum, p) => sum + p.votes, 0);
  const votePercentage = totalVotes > 0 ? Math.round((proposal.votes / totalVotes) * 100) : 0;
  const { isContained, showInlineRank } = useLeaderboardTableLayout(isVotingActive);
  const overlayInsetClassName = isContained
    ? "inset-0"
    : `inset-y-0 ${isVotingActive && hasRank ? "-left-20" : "-left-3"} -right-4`;
  const votingGridClassName = showInlineRank
    ? RANKED_VOTING_GRID_CLASS_NAME
    : "grid-cols-[1fr_120px_80px_80px] lg:grid-cols-[1fr_120px_80px]";

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
        className={`pointer-events-none absolute ${overlayInsetClassName} rounded-lg border transition-opacity duration-200 ease-out ${
          isHighlighted
            ? "border-neutral-10 bg-primary-1 opacity-100"
            : isWinner
              ? WINNER_ROW_CLASS_NAME
              : "border-transparent opacity-0"
        }`}
      />
      {isVotingActive && !isContained && (
        <div className="hidden md:block absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 -ml-6">
          <ProposalLayoutLeaderboardRankOrPlaceholder proposal={proposal} contestStatus={contestStatus} />
        </div>
      )}
      <div
        className={`relative min-w-0 grid ${
          isVotingActive ? votingGridClassName : allowDelete ? "grid-cols-[1fr_auto]" : "grid-cols-[1fr]"
        } items-center gap-6 py-4 ${isContained ? CONTAINED_ROW_INSET_CLASS_NAME : ""} border-b transition-colors duration-200 ease-out ${
          isHighlighted || isWinner ? "border-transparent" : "border-neutral-4"
        }`}
      >
        {showInlineRank && (
          <ProposalLayoutLeaderboardRankOrPlaceholder proposal={proposal} contestStatus={contestStatus} />
        )}
        <div className="flex min-w-0 items-center gap-3">
          <p className="min-w-0 text-[16px] text-neutral-11 normal-case truncate">{entryTitle}</p>
          {isWinner ? <WinnerBadge variant="inline" /> : null}
        </div>
        {isVotingActive ? (
          <>
            <p className="text-[16px] text-neutral-11 tabular-nums">
              <VoteCountPulse votes={proposal.votes}>{formatNumberWithCommas(proposal.votes)}</VoteCountPulse>
            </p>
            <p className="text-[24px] text-neutral-11 tabular-nums">{votePercentage}%</p>
            <div className="lg:hidden flex justify-end">
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
