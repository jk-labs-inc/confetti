import { useContestLeaderboard, useSyncVerifyAddresses } from "@hooks/useContestLeaderboard";
import { ContestStatus, useContestStatusStore } from "@hooks/useContestStatus/store";
import { useNativePriceFormatter } from "@hooks/useNativePriceFormatter";
import { FC, useState } from "react";
import EmptyLeaderboard from "../MarketRail/components/LeaderboardList/EmptyLeaderboard";
import LeaderboardSkeleton from "../MarketRail/components/LeaderboardList/LeaderboardSkeleton";
import BoardCaption from "./components/Caption";
import Fold from "./components/Fold";
import Podium from "./components/Podium";
import BoardRow from "./components/Row";
import BoardSortControl from "./components/SortControl";
import { BOARD_LIST_MAX_HEIGHT_PX, BOARD_LIST_SCROLL_CLASS_NAME, BOARD_SKELETON_ROWS, BoardSort } from "./constants";
import { useBoardView } from "./useBoardView";

const FullBoard: FC = () => {
  const [verifyAddresses, setVerifyAddresses] = useState<string[]>([]);
  const [sort, setSort] = useState<BoardSort>(BoardSort.Payout);
  const isVotingOpen = useContestStatusStore(state => state.contestStatus) === ContestStatus.VotingOpen;
  const formatPrice = useNativePriceFormatter();

  const { rows, viewerRow, totals, isEarningsAvailable, isLoading } = useContestLeaderboard({ verifyAddresses });
  const view = useBoardView({ rows, viewerRow, sort });
  useSyncVerifyAddresses(view.visibleRows, setVerifyAddresses);

  return (
    <div className="flex min-h-0 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <BoardCaption
          poolLabel={isEarningsAvailable ? formatPrice(totals.poolNative) : null}
          isVotingOpen={isVotingOpen}
        />
        {isEarningsAvailable && <BoardSortControl sort={sort} onSortChange={setSort} />}
      </div>
      {isLoading && rows.length === 0 ? (
        <LeaderboardSkeleton count={BOARD_SKELETON_ROWS} />
      ) : rows.length === 0 ? (
        <EmptyLeaderboard />
      ) : (
        <>
          <Podium rows={view.podiumRows} formatPrice={formatPrice} />
          <div className={BOARD_LIST_SCROLL_CLASS_NAME} style={{ maxHeight: BOARD_LIST_MAX_HEIGHT_PX }}>
            {view.listRows.map(row => (
              <BoardRow key={row.address} row={row} formatPrice={formatPrice} />
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
        </>
      )}
      {view.pinnedViewerRow ? <BoardRow row={view.pinnedViewerRow} formatPrice={formatPrice} /> : null}
    </div>
  );
};

export default FullBoard;
