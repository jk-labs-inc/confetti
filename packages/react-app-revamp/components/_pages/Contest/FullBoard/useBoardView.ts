import { LeaderboardRow, rankRowsByMultiple } from "@hooks/useContestLeaderboard";
import { useCallback, useMemo, useState } from "react";
import { BOARD_TOP_ROWS, BoardSort, PODIUM_SIZE } from "./constants";

export interface BoardFold {
  hiddenCount: number;
  fromRank: number;
  toRank: number;
}

export interface BoardView {
  podiumRows: LeaderboardRow[];
  listRows: LeaderboardRow[];
  visibleRows: LeaderboardRow[];
  pinnedViewerRow: LeaderboardRow | null;
  fold: BoardFold | null;
  expand: () => void;
}

interface UseBoardViewParams {
  rows: LeaderboardRow[];
  viewerRow: LeaderboardRow | null;
  sort: BoardSort;
}

export const useBoardView = ({ rows, viewerRow, sort }: UseBoardViewParams): BoardView => {
  const [isExpanded, setIsExpanded] = useState(false);
  const expand = useCallback(() => setIsExpanded(true), []);

  const rankedRows = useMemo(() => {
    const boardRows = rows.filter(row => row.isOnBoard);
    return sort === BoardSort.Multiple ? rankRowsByMultiple(boardRows) : boardRows;
  }, [rows, sort]);

  return useMemo<BoardView>(() => {
    const visibleRows = isExpanded ? rankedRows : rankedRows.slice(0, BOARD_TOP_ROWS);
    const hiddenRows = rankedRows.slice(visibleRows.length);
    const isViewerVisible = visibleRows.some(row => row.isViewer);

    return {
      podiumRows: visibleRows.slice(0, PODIUM_SIZE),
      listRows: visibleRows.slice(PODIUM_SIZE),
      visibleRows,
      pinnedViewerRow: isViewerVisible ? null : (rankedRows.find(row => row.isViewer) ?? viewerRow),
      fold:
        hiddenRows.length > 0
          ? {
              hiddenCount: hiddenRows.length,
              fromRank: hiddenRows[0].rank,
              toRank: hiddenRows[hiddenRows.length - 1].rank,
            }
          : null,
      expand,
    };
  }, [rankedRows, viewerRow, isExpanded, expand]);
};
