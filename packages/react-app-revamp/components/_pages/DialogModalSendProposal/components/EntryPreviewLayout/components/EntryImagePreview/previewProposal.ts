import { parseEntry } from "@components/EntryCarousel/parseEntry";
import { Proposal } from "@components/_pages/ProposalContent";
import { toContentProposal } from "@components/_pages/ProposalContent/toContentProposal";
import { EntryPreview } from "@hooks/useDeployContest/slices/contestMetadataSlice";
import { ProposalCore } from "@hooks/useProposal/store";
import { recallImageAspectRatio } from "lib/image/aspectRatioRegistry";

export const buildPreviewProposal = (metadataValue: string): Proposal => ({
  id: "entry-image-preview",
  authorEthereumAddress: "",
  content: "",
  exists: true,
  isContentImage: false,
  tweet: { isTweet: false, id: "" },
  votes: 0,
  rank: 0,
  isTied: false,
  metadataFields: { addressArray: [], stringArray: [metadataValue], uintArray: [] },
});

export const recallEntryHeightRatios = (entries: ProposalCore[], enabledPreview: EntryPreview): number[] =>
  entries.flatMap(entry => {
    const parsed = parseEntry(toContentProposal(entry), enabledPreview);
    const widthOverHeight = parsed.kind === "image" ? recallImageAspectRatio(parsed.imageUrl) : undefined;
    return widthOverHeight ? [1 / widthOverHeight] : [];
  });
