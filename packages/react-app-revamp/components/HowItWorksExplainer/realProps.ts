import type { Proposal } from "@components/_pages/ProposalContent";
import type ProposalLayoutGallery from "@components/_pages/ProposalContent/components/ProposalLayout/Gallery";
import { STAGE_WIDTH_PX } from "@components/HowItWorksExplainer/engine";
import { entryPriceInput } from "@components/Voting/components/RewardsProjection/display";
import { ContestStatus } from "@hooks/useContestStatus/store";
import { EntryPreview } from "@hooks/useDeployContest/slices/contestMetadataSlice";
import type { UseVoteProjectionsReturn } from "@hooks/useVoteProjections";
import type { DemoEntry } from "lib/howItWorks/demo";
import { formatDemoPrice } from "lib/howItWorks/display";
import type { ComponentProps } from "react";

type GalleryProps = ComponentProps<typeof ProposalLayoutGallery>;

export const ENTRY_CARD_LAYOUT_WIDTH_PX = 232;
export const ENTRY_CARD_SIZE_PX = 96;
const ENTRY_CARD_GAP_PX = 8;
const ENTRY_ROW_SIZE = 3;
const ENTRY_ROW_LEFT_PX =
  (STAGE_WIDTH_PX - ENTRY_ROW_SIZE * ENTRY_CARD_SIZE_PX - (ENTRY_ROW_SIZE - 1) * ENTRY_CARD_GAP_PX) / 2;

export const entryRowLeft = (index: number) => ENTRY_ROW_LEFT_PX + index * (ENTRY_CARD_SIZE_PX + ENTRY_CARD_GAP_PX);

const DEMO_AUTHOR_ADDRESS = "0x0000000000000000000000000000000000000000";

const metadataByEntryId = new Map<string, Proposal["metadataFields"]>();

const metadataFor = (entry: DemoEntry): Proposal["metadataFields"] => {
  const cached = metadataByEntryId.get(entry.id);
  if (cached) return cached;
  const imageAndTitle = new URLSearchParams({ JOKERACE_IMG: entry.photoSrc, JOKERACE_IMG_TITLE: entry.name });
  const metadata = { addressArray: [], stringArray: [imageAndTitle.toString()], uintArray: [] };
  metadataByEntryId.set(entry.id, metadata);
  return metadata;
};

export const demoProposal = (entry: DemoEntry, state: { votes: number; rank: number }): Proposal => ({
  id: entry.id,
  authorEthereumAddress: DEMO_AUTHOR_ADDRESS,
  content: "",
  exists: true,
  isContentImage: true,
  tweet: { isTweet: false, id: "" },
  votes: state.votes,
  rank: state.rank,
  isTied: false,
  metadataFields: metadataFor(entry),
});

export const demoProjectionDisplay = (projections: UseVoteProjectionsReturn) => {
  const entryInput = entryPriceInput(projections.entryProjection);
  return {
    entryFormatted: formatDemoPrice(entryInput.value, entryInput.options),
    winUpToFormatted: formatDemoPrice(projections.winUpTo.amount),
  };
};

export const DEMO_CARD_PROPS = {
  proposalAuthorData: { name: "", avatar: "", isLoading: false, isError: false },
  isMobile: false,
  contestStatus: ContestStatus.VotingOpen,
  allowDelete: false,
  selectedProposalIds: [],
  enabledPreview: EntryPreview.IMAGE_AND_TITLE,
  votersChipEnabled: false,
} satisfies Omit<GalleryProps, "proposal">;
