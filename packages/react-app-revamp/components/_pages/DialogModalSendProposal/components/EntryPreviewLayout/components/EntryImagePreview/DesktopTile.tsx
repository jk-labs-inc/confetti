import { Proposal } from "@components/_pages/ProposalContent";
import ProposalLayoutGallery from "@components/_pages/ProposalContent/components/ProposalLayout/Gallery";
import GalleryImageShapeProvider from "@components/_pages/ProposalContent/components/ProposalLayout/Gallery/ImageShape/Provider";
import { ContestStatus } from "@hooks/useContestStatus/store";
import { EntryPreview } from "@hooks/useDeployContest/slices/contestMetadataSlice";
import { ProposalCore } from "@hooks/useProposal/store";
import { FC, useState } from "react";
import { recallEntryHeightRatios } from "./previewProposal";
import ScaledFrame from "./ScaledFrame";
import { measureDesktopTileWidth, PREVIEW_MAX_HEIGHT_PX, PREVIEW_MAX_WIDTH_PX } from "./sizing";

const NO_AUTHOR = { name: "", avatar: "", isLoading: false, isError: false };
const NO_SELECTED_PROPOSAL_IDS: string[] = [];

interface DesktopTileProps {
  proposal: Proposal;
  enabledPreview: EntryPreview;
  contestStatus: ContestStatus;
  entries: ProposalCore[];
}

const DesktopTile: FC<DesktopTileProps> = ({ proposal, enabledPreview, contestStatus, entries }) => {
  const [width] = useState(measureDesktopTileWidth);
  const [entryHeightRatios] = useState(() => recallEntryHeightRatios(entries, enabledPreview));

  return (
    <ScaledFrame width={width} maxWidth={PREVIEW_MAX_WIDTH_PX} maxHeight={PREVIEW_MAX_HEIGHT_PX}>
      <GalleryImageShapeProvider initialHeightRatios={entryHeightRatios}>
        <ProposalLayoutGallery
          proposal={proposal}
          proposalAuthorData={NO_AUTHOR}
          isMobile={false}
          contestStatus={contestStatus}
          allowDelete={false}
          selectedProposalIds={NO_SELECTED_PROPOSAL_IDS}
          enabledPreview={enabledPreview}
          votersChipEnabled={false}
        />
      </GalleryImageShapeProvider>
    </ScaledFrame>
  );
};

export default DesktopTile;
