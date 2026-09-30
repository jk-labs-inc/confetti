import { CARD_IN_VIEW_MARGIN } from "@components/EntryVoters/constants";
import { toastInfo } from "@components/UI/Toast";
import { ENTRY_ACCENT_COLOR } from "@helpers/entryColors";
import { extractPathSegments } from "@helpers/extractPath";
import { MOBILE_MAX_WIDTH_PX } from "@helpers/isMobileViewport";
import { Tweet as TweetType } from "@helpers/isContentTweet";
import { useCastVotesStore } from "@hooks/useCastVotes/store";
import { useHasVoteRail } from "@hooks/useContestLayoutBand";
import { ContestStateEnum, useContestStateStore } from "@hooks/useContestState/store";
import { ContestStatus, useContestStatusStore } from "@hooks/useContestStatus/store";
import useDeleteProposal from "@hooks/useDeleteProposal";
import { EntryPreview } from "@hooks/useDeployContest/slices/contestMetadataSlice";
import useProfileData from "@hooks/useProfileData";
import { isWinningEntry, RawMetadataFields } from "@hooks/useProposal/utils";
import { useWallet } from "@hooks/useWallet";
import { usePathname } from "next/navigation";
import { useInView } from "motion/react";
import { FC, useRef, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { useShallow } from "zustand/shallow";
import DrawerVoteForProposal from "../DrawerVoteForProposal";
import VoteParticleOverlay from "./components/VoteFeedback/VoteParticleOverlay";
import WinnerCelebration from "./components/WinnerCelebration";
import ProposalLayoutClassic from "./components/ProposalLayout/Classic";
import ProposalLayoutGallery from "./components/ProposalLayout/Gallery";
import ProposalLayoutLeaderboard from "./components/ProposalLayout/Leaderboard";
import ProposalLayoutTweet from "./components/ProposalLayout/Tweet";
import { ENTRY_CARD_GROUP_CLASS_NAME } from "./components/ProposalLayout/entryCardFrame";

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
  const isMobile = useMediaQuery({ maxWidth: MOBILE_MAX_WIDTH_PX });
  const hasVoteRail = useHasVoteRail();
  const asPath = usePathname();
  const { address: contestAddress } = extractPathSegments(asPath ?? "");
  const [isVotingDrawerOpen, setIsVotingDrawerOpen] = useState(false);
  const { contestState } = useContestStateStore(state => state);
  const isContestCanceled = contestState === ContestStateEnum.Canceled;
  const isVotingOpenStatus = contestStatus === ContestStatus.VotingOpen;
  const canSelectForSidebar = !isContestCanceled && isVotingOpenStatus;
  const isWinner = isWinningEntry(proposal, contestStatus, isContestCanceled);
  const showWinnerCelebration = isWinner && enabledPreview !== EntryPreview.TITLE;
  const { setPickedProposal, pickedProposal } = useCastVotesStore(
    useShallow(state => ({
      setPickedProposal: state.setPickedProposal,
      pickedProposal: state.pickedProposal,
    })),
  );
  const isPicked = pickedProposal === proposal.id;
  const isSelectableOnDesktop = hasVoteRail && canSelectForSidebar && !isPicked;
  const isHighlighted = isPicked && (hasVoteRail || isVotingDrawerOpen);
  const highlightColor = isHighlighted ? ENTRY_ACCENT_COLOR : undefined;
  const cardRef = useRef<HTMLDivElement>(null);
  const isCardInView = useInView(cardRef, { margin: CARD_IN_VIEW_MARGIN });
  const votersChipEnabled = isCardInView && hasVoteRail;
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
    votersChipEnabled,
    isWinner,
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

    if (!hasVoteRail) {
      if (isVotingOpenStatus) handleVotingDrawerOpen();
      return;
    }

    if (canSelectForSidebar) setPickedProposal(proposal.id);
  };

  return (
    <>
      <div
        ref={cardRef}
        onClick={handleCardClick}
        data-selectable={isSelectableOnDesktop || undefined}
        className={`${ENTRY_CARD_GROUP_CLASS_NAME} relative transition-opacity duration-300 ease-in-out ${
          isSelectableOnDesktop ? "lg:cursor-pointer" : ""
        } ${shouldReduceOpacity ? "opacity-30" : "opacity-100"}`}
      >
        {showWinnerCelebration && <WinnerCelebration />}
        {showWinnerCelebration ? <div className="relative z-[1]">{renderLayout()}</div> : renderLayout()}
        <VoteParticleOverlay votes={proposal.votes} />
      </div>
      <DrawerVoteForProposal isOpen={isVotingDrawerOpen} setIsOpen={handleVotingDrawerClose} />
    </>
  );
};

export default ProposalContent;
