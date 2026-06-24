import { toastInfo } from "@components/UI/Toast";
import { entryMedal, withAlpha } from "@helpers/entryColors";
import { extractPathSegments } from "@helpers/extractPath";
import { Tweet as TweetType } from "@helpers/isContentTweet";
import { useCastVotesStore } from "@hooks/useCastVotes/store";
import { ContestStateEnum, useContestStateStore } from "@hooks/useContestState/store";
import { ContestStatus, useContestStatusStore } from "@hooks/useContestStatus/store";
import useDeleteProposal from "@hooks/useDeleteProposal";
import { EntryPreview } from "@hooks/useDeployContest/slices/contestMetadataSlice";
import useProfileData from "@hooks/useProfileData";
import { RawMetadataFields } from "@hooks/useProposal/utils";
import { useWallet } from "@hooks/useWallet";
import { usePathname } from "next/navigation";
import { FC, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { useShallow } from "zustand/shallow";
import DrawerVoteForProposal from "../DrawerVoteForProposal";
import VoteParticleOverlay from "./components/VoteFeedback/VoteParticleOverlay";
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
  const isDesktop = useMediaQuery({ minWidth: 1280 });
  const asPath = usePathname();
  const { address: contestAddress } = extractPathSegments(asPath ?? "");
  const [isVotingDrawerOpen, setIsVotingDrawerOpen] = useState(false);
  const { contestState } = useContestStateStore(state => state);
  const isContestCanceled = contestState === ContestStateEnum.Canceled;
  const isVotingOpenStatus = contestStatus === ContestStatus.VotingOpen;
  const isVotingClosedStatus = contestStatus === ContestStatus.VotingClosed;
  const canSelectForSidebar =
    !isContestCanceled && (isVotingOpenStatus || (isVotingClosedStatus && proposal.votes > 0));
  const { setPickedProposal, pickedProposal } = useCastVotesStore(
    useShallow(state => ({
      setPickedProposal: state.setPickedProposal,
      pickedProposal: state.pickedProposal,
    })),
  );
  const isPicked = pickedProposal === proposal.id;
  const isHighlighted = isPicked && (isDesktop || isVotingDrawerOpen);
  const highlightColor = isHighlighted ? withAlpha(entryMedal(proposal.rank).solid, 0.6) : undefined;
  const shouldReduceOpacity = isVotingDrawerOpen && !isPicked;
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
    contestAddress,
    contestStatus,
    allowDelete,
    selectedProposalIds,
    handleVotingDrawerOpen,
    toggleProposalSelection,
    enabledPreview,
    isHighlighted,
    highlightColor,
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

  const handleCardClick = () => {
    if (isContestCanceled) return;

    if (!isDesktop) {
      if (isVotingOpenStatus) handleVotingDrawerOpen();
      return;
    }

    if (canSelectForSidebar) setPickedProposal(proposal.id);
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className={`relative transition-opacity duration-300 ease-in-out ${
          isDesktop && canSelectForSidebar ? "xl:cursor-pointer" : ""
        } ${shouldReduceOpacity ? "opacity-30" : "opacity-100"}`}
      >
        {renderLayout()}
        <VoteParticleOverlay votes={proposal.votes} />
      </div>
      <DrawerVoteForProposal isOpen={isVotingDrawerOpen} setIsOpen={handleVotingDrawerClose} />
    </>
  );
};

export default ProposalContent;
