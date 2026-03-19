import { toastInfo } from "@components/UI/Toast";
import { extractPathSegments } from "@helpers/extractPath";
import { Tweet as TweetType } from "@helpers/isContentTweet";
import { useCastVotesStore } from "@hooks/useCastVotes/store";
import { useContestStore } from "@hooks/useContest/store";
import { ContestStateEnum, useContestStateStore } from "@hooks/useContestState/store";
import { ContestStatus, useContestStatusStore } from "@hooks/useContestStatus/store";
import useDeleteProposal from "@hooks/useDeleteProposal";
import { EntryPreview } from "@hooks/useDeployContest/slices/contestMetadataSlice";
import useProfileData from "@hooks/useProfileData";
import { RawMetadataFields } from "@hooks/useProposal/utils";
import { useWallet } from "@hooks/useWallet";
import moment from "moment";
import { usePathname } from "next/navigation";
import { FC, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { useShallow } from "zustand/shallow";
import DrawerVoteForProposal from "../DrawerVoteForProposal";
import ProposalLayoutClassic from "./components/ProposalLayout/Classic";
import ProposalLayoutGallery from "./components/ProposalLayout/Gallery";
import ProposalLayoutLeaderboard from "./components/ProposalLayout/Leaderboard";
import ProposalLayoutTweet from "./components/ProposalLayout/Tweet";

export interface Proposal {
  id: string;
  authorEthereumAddress: string;
  content: string;
  exists: boolean;
  isContentImage: boolean;
  tweet: TweetType;
  votes: number;
  rank: number;
  isTied: boolean;
  commentsCount: number;
  metadataFields: RawMetadataFields;
}

interface ProposalContentProps {
  proposal: Proposal;
  contestAuthorEthereumAddress: string;
  enabledPreview: EntryPreview | null;
  selectedProposalIds: string[];
  toggleProposalSelection?: (proposalId: string) => void;
}

const ProposalContent: FC<ProposalContentProps> = ({
  proposal,
  contestAuthorEthereumAddress,
  selectedProposalIds,
  toggleProposalSelection,
  enabledPreview,
}) => {
  const { userAddress } = useWallet();
  const { canDeleteProposal } = useDeleteProposal();
  const contestStatus = useContestStatusStore(useShallow(state => state.contestStatus));
  const allowDelete = canDeleteProposal(
    userAddress,
    contestAuthorEthereumAddress,
    proposal.authorEthereumAddress,
    contestStatus,
  );
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const asPath = usePathname();
  const { chainName, address: contestAddress } = extractPathSegments(asPath ?? "");
  const [isVotingDrawerOpen, setIsVotingDrawerOpen] = useState(false);
  const { votesOpen } = useContestStore(state => state);
  const { contestState } = useContestStateStore(state => state);
  const isContestCanceled = contestState === ContestStateEnum.Canceled;
  const { setPickedProposal, pickedProposal } = useCastVotesStore(
    useShallow(state => ({
      setPickedProposal: state.setPickedProposal,
      pickedProposal: state.pickedProposal,
    })),
  );
  const formattedVotingOpen = moment(votesOpen);
  const isAnyDrawerOpen = pickedProposal !== null;
  const isHighlighted = isAnyDrawerOpen && pickedProposal === proposal.id;
  const shouldReduceOpacity = isAnyDrawerOpen && !isHighlighted;
  const commentLink = {
    pathname: `/contest/${chainName}/${contestAddress}/submission/${proposal.id}`,
    query: { comments: "comments" },
  };
  const {
    profileAvatar,
    profileName,
    isLoading: isUserProfileLoading,
    isError: isUserProfileError,
  } = useProfileData(proposal.authorEthereumAddress, true);

  const handleVotingDrawerOpen = () => {
    if (isContestCanceled) {
      alert("This contest has been canceled and voting is terminated.");
      return;
    }

    if (contestStatus === ContestStatus.VotingClosed) {
      toastInfo({
        message: "Voting is closed for this contest.",
      });
      return;
    }

    setPickedProposal(proposal.id);
    setIsVotingDrawerOpen(true);
  };

  const handleVotingDrawerClose = (isOpen: boolean) => {
    setIsVotingDrawerOpen(isOpen);
    if (!isOpen) {
      setPickedProposal(null);
    }
  };

  const props = {
    proposal,
    proposalAuthorData: {
      name: profileName,
      avatar: profileAvatar,
      isLoading: isUserProfileLoading,
      isError: isUserProfileError,
    },
    isMobile,
    chainName,
    contestAddress,
    contestStatus,
    allowDelete,
    selectedProposalIds,
    handleVotingDrawerOpen,
    toggleProposalSelection,
    formattedVotingOpen,
    enabledPreview,
    commentLink: commentLink.pathname,
    isHighlighted,
  };

  const renderLayout = () => {
    switch (enabledPreview) {
      case EntryPreview.TITLE:
        return <ProposalLayoutLeaderboard {...props} />;
      case EntryPreview.IMAGE:
      case EntryPreview.IMAGE_AND_TITLE:
        return <ProposalLayoutGallery {...props} />;
      case EntryPreview.TWEET:
      case EntryPreview.TWEET_AND_TITLE:
        return <ProposalLayoutTweet {...props} />;
      default:
        return <ProposalLayoutClassic {...props} />;
    }
  };

  return (
    <>
      <div
        className={`transition-all duration-300 ease-in-out ${
          shouldReduceOpacity
            ? "opacity-30 scale-[0.98]"
            : isHighlighted
              ? "opacity-100 scale-[1.02] -translate-y-1 z-45 relative"
              : "opacity-100 scale-100"
        }`}
      >
        {renderLayout()}
      </div>
      <DrawerVoteForProposal isOpen={isVotingDrawerOpen} setIsOpen={handleVotingDrawerClose} />
    </>
  );
};

export default ProposalContent;
