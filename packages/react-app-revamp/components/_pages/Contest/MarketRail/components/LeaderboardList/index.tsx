import { LeaderboardRow as LeaderboardRowData } from "@hooks/useContestLeaderboard";
import { NativePriceFormatter } from "@hooks/useNativePriceFormatter";
import { FC } from "react";
import { LEADERBOARD_SKELETON_ROWS } from "../../constants";
import RailBoardRow from "../RailBoardRow";
import EmptyLeaderboard from "./EmptyLeaderboard";
import LeaderboardSkeleton from "./LeaderboardSkeleton";

interface LeaderboardListProps {
  rows: LeaderboardRowData[];
  pinnedViewerRow: LeaderboardRowData | null;
  formatPrice: NativePriceFormatter;
  isLoading: boolean;
}

const LeaderboardList: FC<LeaderboardListProps> = ({ rows, pinnedViewerRow, formatPrice, isLoading }) => (
  <div className="flex shrink-0 flex-col">
    <div className="flex flex-col">
      {isLoading && rows.length === 0 ? (
        <LeaderboardSkeleton count={LEADERBOARD_SKELETON_ROWS} />
      ) : rows.length === 0 ? (
        <EmptyLeaderboard />
      ) : (
        rows.map(row => <RailBoardRow key={row.address} row={row} formatPrice={formatPrice} />)
      )}
    </div>
    {pinnedViewerRow ? <RailBoardRow row={pinnedViewerRow} formatPrice={formatPrice} /> : null}
  </div>
);

export default LeaderboardList;
