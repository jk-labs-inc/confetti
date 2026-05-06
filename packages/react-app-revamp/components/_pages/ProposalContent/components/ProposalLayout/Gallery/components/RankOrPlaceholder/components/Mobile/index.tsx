import { Proposal } from "@components/_pages/ProposalContent";
import RankBadge from "@components/UI/RankBadge";
import { ContestStatus } from "@hooks/useContestStatus/store";
import { FC } from "react";

interface ProposalLayoutGalleryRankOrPlaceholderMobileProps {
  proposal: Proposal;
  contestStatus: ContestStatus;
}

const MEDAL_IMAGES: Record<number, string> = {
  1: "/contest/gold-medal.png",
  2: "/contest/silver-medal.png",
  3: "/contest/bronze-medal.png",
};

const ProposalLayoutGalleryRankOrPlaceholderMobile: FC<ProposalLayoutGalleryRankOrPlaceholderMobileProps> = ({
  proposal,
}) => {
  if (!proposal.rank) {
    return <div className="w-6 h-6" />;
  }

  const medalSrc = MEDAL_IMAGES[proposal.rank];
  if (medalSrc) {
    return <img src={medalSrc} alt={`Rank ${proposal.rank}`} className="w-6 h-6 object-contain" />;
  }
  return <RankBadge rank={proposal.rank} size="sm" />;
};

export default ProposalLayoutGalleryRankOrPlaceholderMobile;
