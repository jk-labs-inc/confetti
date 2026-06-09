import { Proposal } from "@components/_pages/ProposalContent";
import VoteCountPulse from "@components/_pages/ProposalContent/components/VoteFeedback";
import { CheckIcon, TrashIcon } from "@heroicons/react/24/outline";
import { ContestStatus } from "@hooks/useContestStatus/store";
import { EntryPreview } from "@hooks/useDeployContest/slices/contestMetadataSlice";
import { formatNumberWithCommas } from "@helpers/formatNumber";
import { FC, useEffect, useState } from "react";
import ProposalContentVotePrimary from "../../Buttons/Vote/Primary";
import ImageWithFallback from "../../ImageWithFallback";
import ProposalLayoutGalleryRankOrPlaceholder from "./components/RankOrPlaceholder";

const galleryOverlayTextStyle: React.CSSProperties = {
  color: "#E5E5E5",
  textShadow: "1px 1px 0 #000",
  WebkitTextStroke: "0.3px #000",
};

interface ProposalLayoutGalleryProps {
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
  enabledPreview: EntryPreview | null;
  isHighlighted: boolean;
  handleVotingDrawerOpen?: () => void;
  toggleProposalSelection?: (proposalId: string) => void;
}

const ProposalLayoutGallery: FC<ProposalLayoutGalleryProps> = ({
  proposal,
  contestStatus,
  allowDelete,
  selectedProposalIds,
  enabledPreview,
  isHighlighted,
  handleVotingDrawerOpen,
  toggleProposalSelection,
}) => {
  const [imgUrl, setImgUrl] = useState<string>("");
  const [imgTitle, setImgTitle] = useState<string>("");
  const isVotingNotOpenYet = contestStatus !== ContestStatus.VotingOpen && contestStatus !== ContestStatus.VotingClosed;

  const updateImgUrl = () => {
    if (enabledPreview === EntryPreview.IMAGE_AND_TITLE) {
      const params = new URLSearchParams(proposal.metadataFields.stringArray[0]);
      const imageUrl = params.get("JOKERACE_IMG") || "";
      const title = params.get("JOKERACE_IMG_TITLE") || "";

      setImgUrl(imageUrl);
      setImgTitle(title);
    } else {
      setImgUrl(proposal.metadataFields.stringArray[0]);
      setImgTitle("");
    }
  };

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

  useEffect(() => {
    updateImgUrl();
  }, [enabledPreview, proposal.metadataFields.stringArray]);

  return (
    <div
      className={`flex flex-col gap-2 p-2 bg-true-black rounded-2xl shadow-entry-card w-full max-h-[70vh] border-2 transition duration-150 ease-out active:scale-[0.98] ${
        isHighlighted ? "border-secondary-14" : "border-transparent"
      }`}
    >
      <div className="rounded-2xl overflow-hidden relative">
        <ImageWithFallback fullSrc={imgUrl} alt="entry image" />

        <div className="xl:hidden absolute top-1 left-2 right-2 flex items-center justify-between">
          <div>{proposal.rank ? <ProposalLayoutGalleryRankOrPlaceholder rank={proposal.rank} /> : null}</div>
          <div
            className="flex flex-col items-end gap-0.5"
            style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.6)" }}
          >
            {imgTitle ? <p className="text-[12px] font-bold text-neutral-11">{imgTitle}</p> : null}
            {(contestStatus === ContestStatus.VotingOpen || contestStatus === ContestStatus.VotingClosed) &&
            proposal.votes > 0 ? (
              <p className="text-[12px] text-neutral-11">
                <VoteCountPulse votes={proposal.votes}>{formatNumberWithCommas(proposal.votes)}</VoteCountPulse> votes
              </p>
            ) : null}
          </div>
        </div>

        {proposal.rank ? (
          <div className="hidden xl:block absolute top-1 left-2">
            <ProposalLayoutGalleryRankOrPlaceholder rank={proposal.rank} />
          </div>
        ) : null}

        {imgTitle ||
        ((contestStatus === ContestStatus.VotingOpen || contestStatus === ContestStatus.VotingClosed) &&
          proposal.votes > 0) ||
        allowDelete ? (
          <div
            className="hidden xl:block absolute bottom-0 left-0 right-0 pt-12 pb-2 px-2 pointer-events-none"
            style={{
              background:
                "linear-gradient(0deg, rgba(0, 0, 0, 0.60) 0%, rgba(0, 0, 0, 0.40) 49.99%, rgba(0, 0, 0, 0.00) 100%)",
            }}
          >
            {allowDelete ? (
              <div className="absolute bottom-2 left-2 pointer-events-auto" onClick={e => e.stopPropagation()}>
                <div className="bg-true-black/75 w-8 h-6 rounded-full flex items-center justify-center">
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
                </div>
              </div>
            ) : null}
            <div className="flex flex-col items-center">
              {imgTitle ? (
                <p
                  className={`${
                    isVotingNotOpenYet ? "text-[24px]" : "text-[16px]"
                  } font-bold text-center leading-normal`}
                  style={galleryOverlayTextStyle}
                >
                  {imgTitle}
                </p>
              ) : null}
              {(contestStatus === ContestStatus.VotingOpen || contestStatus === ContestStatus.VotingClosed) &&
              proposal.votes > 0 ? (
                <p
                  className="text-[24px] font-bold text-center leading-normal whitespace-nowrap"
                  style={galleryOverlayTextStyle}
                >
                  <VoteCountPulse votes={proposal.votes}>{formatNumberWithCommas(proposal.votes)}</VoteCountPulse> votes
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {allowDelete ? (
          <div className="xl:hidden absolute bottom-1 left-2" onClick={e => e.stopPropagation()}>
            <div className="bg-true-black/75 w-8 h-6 rounded-full flex items-center justify-center">
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
            </div>
          </div>
        ) : null}

        {contestStatus === ContestStatus.VotingOpen ? (
          <div className="xl:hidden absolute bottom-1 left-1/2 transform -translate-x-1/2">
            <ProposalContentVotePrimary proposal={proposal} handleVotingModalOpen={onVotingDrawerOpen} size="large" />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ProposalLayoutGallery;
