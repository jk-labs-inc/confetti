import EntryVotersChip from "@components/EntryVoters/Chip";
import { Proposal } from "@components/_pages/ProposalContent";
import VoteCountPulse from "@components/_pages/ProposalContent/components/VoteFeedback";
import { CheckIcon, TrashIcon } from "@heroicons/react/24/outline";
import { ContestStatus } from "@hooks/useContestStatus/store";
import { EntryPreview } from "@hooks/useDeployContest/slices/contestMetadataSlice";
import { formatNumberWithCommas } from "@helpers/formatNumber";
import { FC, useEffect, useState } from "react";
import ProposalContentVotePrimary from "../../Buttons/Vote/Primary";
import ProposalLayoutGalleryRankOrPlaceholder from "../Gallery/components/RankOrPlaceholder";
import { Tweet } from "./components/CustomTweet";
import { ENTRY_CARD_FRAME_CLASS_NAME, entryCardFrameStyle } from "../entryCardFrame";

interface ProposalLayoutTweetProps {
  proposal: Proposal;
  isMobile: boolean;
  contestStatus: ContestStatus;
  allowDelete: boolean;
  selectedProposalIds: string[];
  enabledPreview: EntryPreview | null;
  highlightColor?: string;
  votersChipEnabled: boolean;
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
  allowDelete,
  selectedProposalIds,
  enabledPreview,
  highlightColor,
  votersChipEnabled,
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
      className={`flex flex-col gap-4 p-1.5 wide:p-2 w-full ${ENTRY_CARD_FRAME_CLASS_NAME}`}
      style={entryCardFrameStyle(highlightColor)}
    >
      <div className="pl-2 items-center flex w-full">
        {proposal.rank ? <ProposalLayoutGalleryRankOrPlaceholder rank={proposal.rank} size="responsive" /> : null}
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden lg:inline-flex">
            <EntryVotersChip proposalId={proposal.id} enabled={votersChipEnabled} reserveSpace />
          </span>
          <div className="flex flex-col gap-1 items-end">
            {tweetTitle ? <p className="text-[12px] font-bold text-neutral-11">{tweetTitle}</p> : null}
            {(contestStatus === ContestStatus.VotingOpen || contestStatus === ContestStatus.VotingClosed) &&
            proposal.votes > 0 ? (
              <p className="text-[12px] text-neutral-11">
                <VoteCountPulse votes={proposal.votes}>{formatNumberWithCommas(proposal.votes)}</VoteCountPulse> votes
              </p>
            ) : null}
          </div>
        </div>
      </div>
      <Tweet id={tweetId} apiUrl={`/api/tweet/${tweetId}`} />
      <div className="mt-auto pl-2">
        <div className="flex gap-2 items-center">
          {contestStatus === ContestStatus.VotingOpen || contestStatus === ContestStatus.VotingClosed ? (
            <span className="lg:hidden">
              <ProposalContentVotePrimary proposal={proposal} handleVotingModalOpen={onVotingDrawerOpen} size="large" />
            </span>
          ) : null}
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
