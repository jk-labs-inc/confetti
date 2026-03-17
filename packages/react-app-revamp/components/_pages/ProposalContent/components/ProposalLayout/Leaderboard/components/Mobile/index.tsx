import { Proposal } from "@components/_pages/ProposalContent";
import ProposalContentDeleteButton from "@components/_pages/ProposalContent/components/Buttons/Delete";
import ProposalContentProfile from "@components/_pages/ProposalContent/components/Profile";
import CustomLink from "@components/UI/Link";
import { formatNumberWithCommas } from "@helpers/formatNumber";
import { ChatBubbleLeftEllipsisIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { ContestStatus } from "@hooks/useContestStatus/store";
import { useRouter } from "next/navigation";
import { FC } from "react";
import ProposalLayoutLeaderboardRankOrPlaceholder from "../RankOrPlaceholder";

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
  proposalAuthorData,
  contestStatus,
  commentLink,
  allowDelete,
  selectedProposalIds,
  toggleProposalSelection,
  handleVotingDrawerOpen,
  chainName,
  contestAddress,
  isHighlighted,
}) => {
  const router = useRouter();
  const entryTitle = proposal.metadataFields.stringArray[0];

  const navigateToCommentLink = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    router.push(commentLink);
  };

  const navigateToVotingDrawer = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    handleVotingDrawerOpen?.();
  };

  const navigateToProposal = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    router.push(`/contest/${chainName.toLowerCase()}/${contestAddress}/submission/${proposal.id}`);
  };

  return (
    <CustomLink
      href={`/contest/${chainName.toLowerCase()}/${contestAddress}/submission/${proposal.id}`}
      className={`w-full flex flex-col min-h-20 gap-4 bg-true-black shadow-entry-card p-4 rounded-2xl border transition-colors duration-300 ease-in-out ${
        isHighlighted ? "border-secondary-14" : "border-transparent"
      }`}
    >
      <div className="flex items-center gap-6">
        <ProposalLayoutLeaderboardRankOrPlaceholder proposal={proposal} contestStatus={contestStatus} />
        <ProposalContentProfile
          name={proposalAuthorData.name}
          avatar={proposalAuthorData.avatar}
          isLoading={proposalAuthorData.isLoading}
          isError={proposalAuthorData.isError}
          textColor="text-neutral-10"
          size="extraSmall"
        />
        <div className="flex items-center ml-auto" onClick={e => e.stopPropagation()}>
          {contestStatus === ContestStatus.VotingOpen || contestStatus === ContestStatus.VotingClosed ? (
            <button
              onClick={navigateToVotingDrawer}
              className="min-w-12 shrink-0 h-6 p-2 flex items-center justify-between gap-2 bg-gradient-vote rounded-[16px] cursor-pointer text-true-black"
            >
              <img src="/contest/upvote-mobile.svg" width={11} height={15} alt="upvote" className="shrink-0" />
              <p className="text-[16px] font-bold grow text-center">{formatNumberWithCommas(proposal.votes)}</p>
            </button>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-6">
        {allowDelete ? (
          <div onClick={e => e.stopPropagation()}>
            <ProposalContentDeleteButton
              proposalId={proposal.id}
              selectedProposalIds={selectedProposalIds}
              toggleProposalSelection={toggleProposalSelection}
            />
          </div>
        ) : (
          <div className="ml-[5px] h-6 w-6 mt-1" />
        )}
        <p className="text-[16px] text-neutral-11 font-bold normal-case">{entryTitle}</p>
        <div className="flex ml-auto" onClick={e => e.stopPropagation()}>
          <button
            onClick={navigateToProposal}
            className="text-neutral-10 hover:text-positive-11 transition-colors duration-300 ease-in-out"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </CustomLink>
  );
};

export default ProposalLayoutLeaderboardMobile;
