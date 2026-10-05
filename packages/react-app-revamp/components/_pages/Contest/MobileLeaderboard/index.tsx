import { useSyncVerifyAddresses } from "@hooks/useContestLeaderboard";
import { FC } from "react";
import Fold from "../FullBoard/components/Fold";
import Podium from "../FullBoard/components/Podium";
import BoardSortControl from "../FullBoard/components/SortControl";
import { BOARD_SKELETON_ROWS } from "../FullBoard/constants";
import EmptyLeaderboard from "../MarketRail/components/LeaderboardList/EmptyLeaderboard";
import LeaderboardSkeleton from "../MarketRail/components/LeaderboardList/LeaderboardSkeleton";
import LeaderboardRow from "../MarketRail/components/LeaderboardRow";
import { useMobileLeaderboard } from "./context";

const MobileLeaderboard: FC = () => {
  const { rows, isEarningsAvailable, isLoading, formatPrice, setVerifyAddresses, sort, setSort, view } =
    useMobileLeaderboard();
  useSyncVerifyAddresses(view.visibleRows, setVerifyAddresses);

  if (isLoading && rows.length === 0) return <LeaderboardSkeleton count={BOARD_SKELETON_ROWS} />;
  if (rows.length === 0) return <EmptyLeaderboard />;

  return (
    <div className="flex flex-col gap-3">
      {isEarningsAvailable && <BoardSortControl sort={sort} onSortChange={setSort} align="start" />}
      <Podium rows={view.podiumRows} formatPrice={formatPrice} size="sheet" />
      <div className="h-px w-full bg-neutral-4" />
      <div className="flex flex-col">
        {view.listRows.map(row => (
          <LeaderboardRow key={row.address} row={row} formatPrice={formatPrice} />
        ))}
        {view.fold && (
          <Fold
            hiddenCount={view.fold.hiddenCount}
            fromRank={view.fold.fromRank}
            toRank={view.fold.toRank}
            onExpand={view.expand}
          />
        )}
      </div>
    </div>
  );
};

export default MobileLeaderboard;
