import { MEDAL_IMAGES } from "@components/PriceCurve/components/Voters/components/EntryRankMedal";
import { FC } from "react";
import { UNRANKED_LABEL } from "../../../FullBoard/constants";

interface RankCellProps {
  rank: number | null;
  className?: string;
}

const RankCell: FC<RankCellProps> = ({ rank, className = "" }) => {
  const medalSrc = rank !== null ? MEDAL_IMAGES[rank] : undefined;

  if (medalSrc) {
    return (
      <img
        src={medalSrc}
        alt={`rank ${rank}`}
        className={`h-[18px] w-[18px] wide:h-5 wide:w-5 justify-self-center object-contain ${className}`}
      />
    );
  }

  return (
    <span className={`text-center text-[11px] font-bold tabular-nums text-neutral-9 ${className}`}>
      {rank ?? UNRANKED_LABEL}
    </span>
  );
};

export default RankCell;
