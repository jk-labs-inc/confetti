import RankBadge from "@components/UI/RankBadge";
import { FC } from "react";

const MEDAL_IMAGES: Record<number, string> = {
  1: "/contest/gold-medal.png",
  2: "/contest/silver-medal.png",
  3: "/contest/bronze-medal.png",
};

interface EntryRankMedalProps {
  rank?: number;
}

/**
 * Small rank medal shown next to an entry title in the voter activity feed.
 * Gold/silver/bronze for the top three, a compact numbered badge beyond that,
 * and nothing for unranked entries. Kept small so it reads as a marker, not a focal point.
 */
const EntryRankMedal: FC<EntryRankMedalProps> = ({ rank }) => {
  if (!rank) return null;

  const medalSrc = MEDAL_IMAGES[rank];
  if (medalSrc) {
    return <img src={medalSrc} alt={`rank ${rank}`} className="h-[18px] w-[18px] flex-none object-contain" />;
  }

  return <RankBadge rank={rank} size="xs" />;
};

export default EntryRankMedal;
