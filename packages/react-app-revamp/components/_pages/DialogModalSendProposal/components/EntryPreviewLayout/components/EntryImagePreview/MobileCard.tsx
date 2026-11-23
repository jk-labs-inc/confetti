import EntryCard from "@components/EntryCarousel/EntryCard";
import { Proposal } from "@components/_pages/ProposalContent";
import { ContestStatus } from "@hooks/useContestStatus/store";
import { EntryPreview } from "@hooks/useDeployContest/slices/contestMetadataSlice";
import { FC, useState } from "react";
import ScaledFrame from "./ScaledFrame";
import { measureMobileCardSize, PREVIEW_MAX_HEIGHT_PX, PREVIEW_MAX_WIDTH_PX } from "./sizing";

const ignoreNavigation = () => {};

interface MobileCardProps {
  proposal: Proposal;
  enabledPreview: EntryPreview;
  contestStatus: ContestStatus;
  hasOtherEntries: boolean;
}

const MobileCard: FC<MobileCardProps> = ({ proposal, enabledPreview, contestStatus, hasOtherEntries }) => {
  const [size] = useState(measureMobileCardSize);

  return (
    <ScaledFrame
      width={size.width}
      height={size.height}
      maxWidth={PREVIEW_MAX_WIDTH_PX}
      maxHeight={PREVIEW_MAX_HEIGHT_PX}
    >
      <EntryCard
        proposal={proposal}
        enabledPreview={enabledPreview}
        contestStatus={contestStatus}
        centered={false}
        imageFetchPriority="high"
        onPrevious={hasOtherEntries ? ignoreNavigation : undefined}
        onNext={hasOtherEntries ? ignoreNavigation : undefined}
      />
    </ScaledFrame>
  );
};

export default MobileCard;
