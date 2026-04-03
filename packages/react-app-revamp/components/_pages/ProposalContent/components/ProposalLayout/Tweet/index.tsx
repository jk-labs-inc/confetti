import { Proposal } from "@components/_pages/ProposalContent";
import CustomLink from "@components/UI/Link";
import { ChatBubbleLeftEllipsisIcon, CheckIcon, TrashIcon } from "@heroicons/react/24/outline";
import { ContestStatus } from "@hooks/useContestStatus/store";
import { EntryPreview } from "@hooks/useDeployContest/slices/contestMetadataSlice";
import { formatNumberWithCommas } from "@helpers/formatNumber";
import { useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";
import ProposalContentVotePrimary from "../../Buttons/Vote/Primary";
import { Tweet } from "./components/CustomTweet";
import ProposalLayoutTweetRankOrPlaceholder from "./components/RankOrPlacehoder";

interface ProposalLayoutTweetProps {
  proposal: Proposal;
  isMobile: boolean;
  chainName: string;
  contestAddress: string;
  contestStatus: ContestStatus;
  formattedVotingOpen: moment.Moment;
  commentLink: string;
  allowDelete: boolean;
  selectedProposalIds: string[];
  enabledPreview: EntryPreview | null;
  isHighlighted: boolean;
  handleVotingDrawerOpen?: () => void;
  toggleProposalSelection?: (proposalId: string) => void;
}

const extractTweetId = (url: string): string => {
  const match = url.match(/\/status\/(\d+)/);
  return match ? match[1] : "";
};

const ProposalLayoutTweet: FC<ProposalLayoutTweetProps> = ({
  proposal,
  isMobile,
  chainName,
  contestAddress,
  contestStatus,
  formattedVotingOpen,
  commentLink,
  allowDelete,
  selectedProposalIds,
  enabledPreview,
  isHighlighted,
  handleVotingDrawerOpen,
  toggleProposalSelection,
}) => {
  const [tweetUrl, setTweetUrl] = useState<string>("");
  const [tweetTitle, setTweetTitle] = useState<string>("");
  const router = useRouter();

  const updateTweetData = () => {
    if (enabledPreview === EntryPreview.TWEET_AND_TITLE) {
      const params = new URLSearchParams(proposal.metadataFields.stringArray[0]);
      const tweet = params.get("JOKERACE_TWEET") || "";
      const title = params.get("JOKERACE_TWEET_TITLE") || "";

      setTweetUrl(tweet);
      setTweetTitle(title);
    } else {
      setTweetUrl(proposal.metadataFields.stringArray[0]);
      setTweetTitle("");
    }
  };

  const tweetId = extractTweetId(tweetUrl);

  useEffect(() => {
    updateTweetData();
  }, [enabledPreview, proposal.metadataFields.stringArray]);

  const onVotingDrawerOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    handleVotingDrawerOpen?.();
  };

  const onCommentLinkClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    router.push(commentLink);
  };

  const onDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    toggleProposalSelection?.(proposal.id);
  };

  return (
    <CustomLink
      scroll={false}
      href={`/contest/${chainName.toLowerCase()}/${contestAddress}/submission/${proposal.id}`}
      className={`flex flex-col gap-4 p-2 bg-true-black rounded-2xl shadow-entry-card w-full border transition-colors duration-300 ease-in-out ${
        isHighlighted ? "border-secondary-14" : "border-transparent hover:border-primary-3"
      }`}
    >
      <div className="pl-2 items-center flex w-full">
        <ProposalLayoutTweetRankOrPlaceholder proposal={proposal} />
        <div className="flex flex-col gap-1 items-end ml-auto">
          {tweetTitle ? <p className="text-[12px] font-bold text-neutral-11">{tweetTitle}</p> : null}
          {(contestStatus === ContestStatus.VotingOpen || contestStatus === ContestStatus.VotingClosed) &&
          proposal.votes > 0 ? (
            <p className="text-[12px] text-neutral-11">{formatNumberWithCommas(proposal.votes)} votes</p>
          ) : null}
        </div>
      </div>
      <Tweet id={tweetId} apiUrl={`/api/tweet/${tweetId}`} />
      <div className="mt-auto pl-2">
        <div className="flex gap-2 items-center">
          {contestStatus === ContestStatus.VotingOpen || contestStatus === ContestStatus.VotingClosed ? (
            <ProposalContentVotePrimary proposal={proposal} handleVotingModalOpen={onVotingDrawerOpen} />
          ) : (
            <p className="text-neutral-10 text-[14px] font-bold">
              voting opens {formattedVotingOpen.format("MMMM Do, h:mm a")}
            </p>
          )}
          <div onClick={e => e.stopPropagation()}>
            <button
              onClick={onCommentLinkClick}
              className="min-w-16 shrink-0 h-6 p-2 flex items-center justify-between gap-2 bg-true-black rounded-[16px] cursor-pointer text-neutral-9  border border-neutral-9 hover:bg-neutral-9 hover:text-true-black transition-colors duration-300 ease-in-out"
            >
              <ChatBubbleLeftEllipsisIcon className="w-4 h-4 shrink-0" />
              <p className="text-[16px] font-bold grow text-center">{proposal.commentsCount}</p>
            </button>
          </div>
          <div className="ml-auto" onClick={e => e.stopPropagation()}>
            {allowDelete ? (
              <button className="relative w-4 h-4 cursor-pointer" onClick={onDeleteClick}>
                <CheckIcon
                  className={`absolute inset-0 transform transition-all ease-in-out duration-300 
            ${selectedProposalIds.includes(proposal.id) ? "opacity-100" : "opacity-0"}
            text-positive-11 bg-transparent border border-positive-11 hover:text-positive-10 
            shadow-md hover:shadow-lg rounded-md`}
                />
                <TrashIcon
                  className={`absolute inset-0 transition-opacity duration-300 
            ${selectedProposalIds.includes(proposal.id) ? "opacity-0" : "opacity-100"}
            text-negative-11 bg-transparent hover:text-negative-10 transition-colors duration-300 ease-in-out`}
                />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </CustomLink>
  );
};

export default ProposalLayoutTweet;
