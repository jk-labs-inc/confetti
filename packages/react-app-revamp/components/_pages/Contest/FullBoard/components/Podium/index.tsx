import { LeaderboardRow } from "@hooks/useContestLeaderboard";
import { EntryTitleLookup } from "@hooks/useLeaderboardEntryTitles";
import { NativePriceFormatter } from "@hooks/useNativePriceFormatter";
import { FC } from "react";
import { PODIUM_ORDER, PodiumSize } from "../../constants";
import PodiumEmptySlot from "./PodiumEmptySlot";
import PodiumSlot from "./PodiumSlot";

interface PodiumProps {
  rows: LeaderboardRow[];
  entryTitleOf: EntryTitleLookup;
  formatPrice: NativePriceFormatter;
  size?: PodiumSize;
}

const Podium: FC<PodiumProps> = ({ rows, entryTitleOf, formatPrice, size = "board" }) => {
  const isViewerSeated = rows.some(row => row.isViewer);

  return (
    <div className="grid grid-cols-3 items-end gap-3">
      {PODIUM_ORDER.map(place => {
        const row = rows[place - 1];
        if (!row) return <PodiumEmptySlot key={place} place={place} isViewerSeated={isViewerSeated} size={size} />;
        return (
          <PodiumSlot
            key={place}
            place={place}
            row={row}
            entryTitle={entryTitleOf(row)}
            formatPrice={formatPrice}
            size={size}
          />
        );
      })}
    </div>
  );
};

export default Podium;
