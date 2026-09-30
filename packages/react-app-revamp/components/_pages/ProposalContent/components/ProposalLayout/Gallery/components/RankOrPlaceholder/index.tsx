import { MEDAL_IMAGES } from "@components/PriceCurve/components/Voters/components/EntryRankMedal";
import RankBadge from "@components/UI/RankBadge";
import { FC } from "react";
import EntryRankCircle from "./components/RankCircle";

export type RankMarkerSize = "default" | "responsive";

interface ProposalLayoutGalleryRankOrPlaceholderProps {
  rank: number;
  size?: RankMarkerSize;
}

const MEDAL_CLASS_NAME: Record<RankMarkerSize, string> = {
  default: "w-10 h-10",
  responsive: "w-[34px] h-[34px] wide:w-10 wide:h-10",
};

const RESPONSIVE_CIRCLE_CLASS_NAME = "w-[26px] h-[26px] text-[13px] wide:w-[30px] wide:h-[30px] wide:text-[14px]";

const ProposalLayoutGalleryRankOrPlaceholder: FC<ProposalLayoutGalleryRankOrPlaceholderProps> = ({
  rank,
  size = "default",
}) => {
  if (rank === 0) return null;

  const medalSrc = MEDAL_IMAGES[rank];
  if (medalSrc) {
    return <img src={medalSrc} alt={`Rank ${rank}`} className={`${MEDAL_CLASS_NAME[size]} object-contain`} />;
  }

  if (size === "responsive") return <EntryRankCircle rank={rank} className={RESPONSIVE_CIRCLE_CLASS_NAME} />;

  return <RankBadge rank={rank} size="md" />;
};

export default ProposalLayoutGalleryRankOrPlaceholder;
