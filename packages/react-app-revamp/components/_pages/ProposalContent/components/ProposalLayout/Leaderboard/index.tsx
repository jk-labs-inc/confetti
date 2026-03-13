import { useEntryPreviewTitleToggleStore } from "@components/_pages/Contest/components/EntryPreviewTitleToggle/store";
import { Proposal } from "@components/_pages/ProposalContent";
import { transform } from "@components/_pages/ProposalContent/utils/markdown";
import CustomLink from "@components/UI/Link";
import { toastInfo } from "@components/UI/Toast";
import { getNumberWithSymbol } from "@helpers/formatNumber";
import { ChatBubbleLeftEllipsisIcon, ChevronDownIcon, ChevronRightIcon, LinkIcon } from "@heroicons/react/24/outline";
import { ContestStatus } from "@hooks/useContestStatus/store";
import { Interweave } from "interweave";
import { UrlMatcher } from "interweave-autolink";
import { FC, useEffect, useState } from "react";
import ProposalContentDeleteButton from "../../Buttons/Delete";
import ProposalContentProfile from "../../Profile";
import ProposalLayoutLeaderboardMobile from "./components/Mobile";
import ProposalLayoutLeaderboardRankOrPlaceholder from "./components/RankOrPlaceholder";
import ProposalContentVotePrimary from "../../Buttons/Vote/Primary";
import ProposalContentVoteSecondary from "../../Buttons/Vote/Secondary";

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
  const [isContentHidden, setIsContentHidden] = useState(true);
  const entryTitle = proposal.metadataFields.stringArray[0];
  const { isExpanded } = useEntryPreviewTitleToggleStore(state => state);

  useEffect(() => {
    if (isExpanded) setIsContentHidden(false);
    else setIsContentHidden(true);
  }, [isExpanded]);

  const handleToggleVisibility = () => {
    setIsContentHidden(!isContentHidden);
  };

  const copyLink = () => {
    const url = `${window.location.origin}/contest/${chainName.toLowerCase()}/${contestAddress}/submission/${
      proposal.id
    }`;
    navigator.clipboard.writeText(url);
    toastInfo({
      message: "link copied!",
    });
  };

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
    <div className={`flex gap-6 ${isContentHidden ? "items-center" : "items-start"}`}>
      {allowDelete && (
        <ProposalContentDeleteButton
          proposalId={proposal.id}
          selectedProposalIds={selectedProposalIds}
          toggleProposalSelection={toggleProposalSelection}
        />
      )}
      <div
        className={`w-full flex flex-col min-h-16 gap-6 bg-true-black shadow-entry-card px-8 py-6 rounded-2xl border transition-colors duration-300 ease-in-out ${
          isHighlighted ? "border-secondary-14" : "border-transparent hover:border-primary-3"
        }`}
      >
        <div className={`flex gap-6 ${isContentHidden ? "items-center" : ""}`}>
          <div className={`${isContentHidden ? "" : "-mt-1"}`}>
            <ProposalLayoutLeaderboardRankOrPlaceholder proposal={proposal} contestStatus={contestStatus} />
          </div>
          <div className="flex flex-col gap-8 w-full">
            <div className="grid grid-cols-[200px_1fr_auto] items-center gap-6">
              <div className="flex items-center gap-4">
                <ProposalContentProfile
                  name={proposalAuthorData.name}
                  avatar={proposalAuthorData.avatar}
                  isLoading={proposalAuthorData.isLoading}
                  isError={proposalAuthorData.isError}
                  textColor="text-neutral-10"
                />
              </div>
              <div className="flex gap-2 items-center min-w-0">
                <p className="text-[16px] text-neutral-11 font-bold normal-case truncate">{entryTitle}</p>
                <CustomLink
                  scroll={false}
                  href={`/contest/${chainName.toLowerCase()}/${contestAddress}/submission/${proposal.id}`}
                  className="shrink-0 w-4 h-4 flex justify-center items-center rounded-full border text-positive-11 border-positive-11 hover:bg-positive-11 hover:text-true-black transition-colors duration-300 ease-in-out group"
                >
                  <ChevronRightIcon className="w-4 h-4 group-hover:brightness-0 group-hover:saturate-0" />
                </CustomLink>
              </div>
              <div className="flex gap-4 items-center">
                {contestStatus === ContestStatus.VotingOpen || contestStatus === ContestStatus.VotingClosed ? (
                  <ProposalContentVotePrimary proposal={proposal} handleVotingModalOpen={handleVotingDrawerOpen} />
                ) : null}
                <ChevronDownIcon
                  className={`w-6 h-6 text-positive-11 cursor-pointer transition-transform duration-300 ${
                    isContentHidden ? "" : "transform rotate-180"
                  }`}
                  onClick={handleToggleVisibility}
                />
              </div>
            </div>
            {!isContentHidden && (
              <>
                <div className="animate-fade-in">
                  <Interweave
                    className="prose prose-invert inline-block w-full overflow-hidden [&>*:not(.not-prose)]:text-neutral-9 [&>*:not(.not-prose) *]:text-neutral-9 max-w-[560px]"
                    content={proposal.content}
                    transform={transform}
                    tagName="div"
                    matchers={[new UrlMatcher("url")]}
                  />
                </div>
                <div className="flex gap-2 items-center">
                  {contestStatus === ContestStatus.VotingOpen || contestStatus === ContestStatus.VotingClosed ? (
                    <ProposalContentVoteSecondary proposal={proposal} handleVotingModalOpen={handleVotingDrawerOpen} />
                  ) : (
                    <p className="text-neutral-10 text-[16px] font-bold">
                      voting opens {formattedVotingOpen.format("MMMM Do, h:mm a")}
                    </p>
                  )}
                  <CustomLink
                    href={commentLink}
                    className="min-w-16 shrink-0 h-6 p-2 flex items-center justify-between gap-2 bg-true-black rounded-[16px] cursor-pointer text-neutral-9  border border-neutral-9 hover:bg-neutral-9 hover:text-true-black transition-colors duration-300 ease-in-out"
                    shallow
                    scroll={false}
                  >
                    <ChatBubbleLeftEllipsisIcon className="w-4 h-4 shrink-0" />
                    <p className="text-[16px] font-bold grow text-center">{proposal.commentsCount}</p>
                  </CustomLink>
                  <button
                    onClick={copyLink}
                    className="min-w-16 text-[16px] font-bold shrink-0 h-6 p-2 flex items-center justify-between gap-2 bg-true-black rounded-[16px] cursor-pointer text-neutral-9  border border-neutral-9 hover:bg-neutral-9 hover:text-true-black transition-colors duration-300 ease-in-out"
                  >
                    <LinkIcon className="w-4 h-4" />
                    copy link
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalLayoutLeaderboard;
