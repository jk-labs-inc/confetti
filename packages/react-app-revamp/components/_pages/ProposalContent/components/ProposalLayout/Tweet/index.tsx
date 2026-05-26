import { Proposal } from "@components/_pages/ProposalContent";
import { CheckIcon, TrashIcon } from "@heroicons/react/24/outline";
import { ContestStatus } from "@hooks/useContestStatus/store";
import { EntryPreview } from "@hooks/useDeployContest/slices/contestMetadataSlice";
import { formatNumberWithCommas } from "@helpers/formatNumber";
import { FC, useEffect, useState } from "react";
import ProposalContentVotePrimary from "../../Buttons/Vote/Primary";
import { Tweet } from "./components/CustomTweet";
import ProposalLayoutTweetRankOrPlaceholder from "./components/RankOrPlacehoder";

interface ProposalLayoutTweetProps {
  proposal: Proposal;
  isMobile: boolean;
  contestStatus: ContestStatus;
  formattedVotingOpen: moment.Moment;
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
  contestStatus,
  formattedVotingOpen,
  allowDelete,
  selectedProposalIds,
  enabledPreview,
  isHighlighted,
  handleVotingDrawerOpen,
  toggleProposalSelection,
}) => {
  const [tweetUrl, setTweetUrl] = useState<string>("");
  const [tweetTitle, setTweetTitle] = useState<string>("");

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

  const onDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    toggleProposalSelection?.(proposal.id);
  };

  return (
    <div
      className={`flex flex-col gap-4 p-2 bg-true-black rounded-2xl shadow-entry-card w-full border-2 transition duration-150 ease-out active:scale-[0.98] ${
        isHighlighted ? "border-secondary-14" : "border-transparent"
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
            <span className="xl:hidden">
              <ProposalContentVotePrimary proposal={proposal} handleVotingModalOpen={onVotingDrawerOpen} size="large" />
            </span>
          ) : (
            <p className="text-neutral-10 text-[14px] font-bold">
              voting opens {formattedVotingOpen.format("MMMM Do, h:mm a")}
            </p>
          )}
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
    </div>
  );
};

export default ProposalLayoutTweet;
