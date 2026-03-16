import RankBadge from "@components/UI/RankBadge";
import { FC } from "react";

interface ProposalLayoutGalleryRankOrPlaceholderProps {
  rank: number;
}

const MEDAL_IMAGES: Record<number, string> = {
  1: "/contest/gold-medal.png",
  2: "/contest/silver-medal.png",
  3: "/contest/bronze-medal.png",
};

const ProposalLayoutGalleryRankOrPlaceholder: FC<ProposalLayoutGalleryRankOrPlaceholderProps> = ({ rank }) => {
  if (rank === 0) return null;

  const medalSrc = MEDAL_IMAGES[rank];
  if (medalSrc) return <img src={medalSrc} alt={`Rank ${rank}`} className="w-12 h-12 object-contain" />;

  return <RankBadge rank={rank} size="md" />;
};

export default ProposalLayoutGalleryRankOrPlaceholder;
