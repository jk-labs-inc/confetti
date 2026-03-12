import { Proposal } from "@components/_pages/ProposalContent";
import CustomLink from "@components/UI/Link";
import { CheckIcon, TrashIcon } from "@heroicons/react/24/outline";
import { ContestStatus } from "@hooks/useContestStatus/store";
import { EntryPreview } from "@hooks/useDeployContest/slices/contestMetadataSlice";
import { formatNumberAbbreviated } from "@helpers/formatNumber";
import { FC, useEffect, useState } from "react";
import ProposalContentVotePrimary from "../../Buttons/Vote/Primary";
import ImageWithFallback from "../../ImageWithFallback";
import ProposalLayoutGalleryRankOrPlaceholder from "./components/RankOrPlaceholder";

interface ProposalLayoutGalleryProps {
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
  enabledPreview: EntryPreview | null;
  isHighlighted: boolean;
  handleVotingDrawerOpen?: () => void;
  toggleProposalSelection?: (proposalId: string) => void;
}

const ProposalLayoutGallery: FC<ProposalLayoutGalleryProps> = ({
  proposal,
  proposalAuthorData,
  chainName,
  contestAddress,
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
    <CustomLink
      scroll={false}
      href={`/contest/${chainName.toLowerCase()}/${contestAddress}/submission/${proposal.id}`}
      className={`flex flex-col gap-2 p-2 bg-true-black rounded-2xl shadow-entry-card w-full max-h-[70vh] border transition-colors duration-300 ease-in-out ${
        isHighlighted ? "border-secondary-14" : "border-transparent hover:border-primary-3"
      }`}
    >
      <div className="rounded-2xl overflow-hidden relative">
        <ImageWithFallback fullSrc={imgUrl} alt="entry image" />

        <div className="absolute top-1 left-2 right-2 flex items-center justify-between">
          <div>{proposal.rank ? <ProposalLayoutGalleryRankOrPlaceholder rank={proposal.rank} /> : null}</div>
          <div className="flex flex-col items-end gap-0.5">
            {imgTitle ? (
              <p className="text-[12px] font-bold text-neutral-11 drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
                {imgTitle}
              </p>
            ) : null}
            {(contestStatus === ContestStatus.VotingOpen || contestStatus === ContestStatus.VotingClosed) &&
            proposal.votes > 0 ? (
              <p className="text-[12px] text-neutral-11 drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
                {formatNumberAbbreviated(proposal.votes)} votes
              </p>
            ) : null}
          </div>
        </div>

        {allowDelete ? (
          <div className="absolute bottom-1 left-2" onClick={e => e.stopPropagation()}>
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

        {contestStatus === ContestStatus.VotingOpen || contestStatus === ContestStatus.VotingClosed ? (
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
            <ProposalContentVotePrimary proposal={proposal} handleVotingModalOpen={onVotingDrawerOpen} />
          </div>
        ) : null}
      </div>
    </CustomLink>
  );
};

export default ProposalLayoutGallery;
