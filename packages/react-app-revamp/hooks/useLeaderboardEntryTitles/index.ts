import useContestConfigStore from "@hooks/useContestConfig/store";
import useContestEntryTitles from "@hooks/useContestEntryTitles";
import { LeaderboardRow } from "@hooks/useContestLeaderboard";
import { useCallback, useMemo } from "react";
import { useShallow } from "zustand/shallow";

export type EntryTitleLookup = (row: LeaderboardRow) => string | undefined;

export const useLeaderboardEntryTitles = (
  rows: LeaderboardRow[],
  pinnedRow: LeaderboardRow | null = null,
): EntryTitleLookup => {
  const contestConfig = useContestConfigStore(useShallow(state => state.contestConfig));
  const idsKey = useMemo(() => {
    const titledRows = pinnedRow ? [...rows, pinnedRow] : rows;
    return Array.from(new Set(titledRows.flatMap(row => (row.mainEntry ? [row.mainEntry.proposalId] : []))))
      .sort()
      .join(",");
  }, [rows, pinnedRow]);
  const proposalIds = useMemo(() => (idsKey ? idsKey.split(",") : []), [idsKey]);
  const { titlesById } = useContestEntryTitles({
    contestConfig,
    proposalIds,
    enabled: !!contestConfig.address && proposalIds.length > 0,
  });

  return useCallback(row => (row.mainEntry ? titlesById.get(row.mainEntry.proposalId) : undefined), [titlesById]);
};

export default useLeaderboardEntryTitles;
