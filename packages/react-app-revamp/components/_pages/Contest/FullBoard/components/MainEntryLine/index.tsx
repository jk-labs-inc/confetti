import { MEDAL_IMAGES } from "@components/PriceCurve/components/Voters/components/EntryRankMedal";
import { formatMainEntryLine, LeaderboardRow } from "@hooks/useContestLeaderboard";
import { FC } from "react";

interface MainEntryLineProps {
  mainEntry: LeaderboardRow["mainEntry"];
  entryTitle?: string;
  medalPx: number;
  className: string;
}

const MainEntryLine: FC<MainEntryLineProps> = ({ mainEntry, entryTitle, medalPx, className }) => {
  const entryMedal = mainEntry ? MEDAL_IMAGES[mainEntry.entryRank] : undefined;

  return (
    <p className={`flex items-center gap-1 normal-case text-neutral-9 ${className}`}>
      {entryMedal && (
        <img src={entryMedal} alt="" className="shrink-0 object-contain" style={{ width: medalPx, height: medalPx }} />
      )}
      <span className="truncate">{formatMainEntryLine(mainEntry, entryTitle)}</span>
    </p>
  );
};

export default MainEntryLine;
