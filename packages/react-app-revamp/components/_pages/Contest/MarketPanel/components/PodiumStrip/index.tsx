import { useContestStatusStore } from "@hooks/useContestStatus/store";
import { useContestLeaderboard, useSyncVerifyAddresses } from "@hooks/useContestLeaderboard";
import { useNativePriceFormatter } from "@hooks/useNativePriceFormatter";
import { FC, useMemo, useState } from "react";
import LeaderboardSkeleton from "../../../MarketRail/components/LeaderboardList/LeaderboardSkeleton";
import { PODIUM_CARD_MIN_WIDTH_PX, PODIUM_STRIP_MAX_CARDS, STRIP_GAP_PX } from "../../constants";
import MarketPanelEmptyState from "../EmptyState";
import { EMPTY_LEADERBOARD_COPY } from "../EmptyState/copy";
import GhostPodiumCard from "../EmptyState/GhostPodiumCard";
import PodiumCard from "./PodiumCard";
import { useFittingCardCount } from "./useFittingCardCount";

const STRIP_SKELETON_ROWS = 2;
const DIVIDER_WIDTH_PX = 1;
const GHOST_PODIUM_RANKS = [1, 2, 3];

const PodiumStrip: FC = () => {
  const [verifyAddresses, setVerifyAddresses] = useState<string[]>([]);
  const formatPrice = useNativePriceFormatter();
  const contestStatus = useContestStatusStore(state => state.contestStatus);

  const { rows, viewerRow, isLoading } = useContestLeaderboard({ verifyAddresses });
  const boardRows = useMemo(() => rows.filter(row => row.isOnBoard), [rows]);
  const { ref, countFor } = useFittingCardCount({
    cardMinWidthPx: PODIUM_CARD_MIN_WIDTH_PX,
    gapPx: STRIP_GAP_PX,
    maxCount: PODIUM_STRIP_MAX_CARDS,
  });
  const unreservedCount = countFor(0);
  const isViewerInStrip = !!viewerRow?.isOnBoard && viewerRow.rank <= unreservedCount;
  const pinnedViewerRow = viewerRow && !isViewerInStrip ? viewerRow : null;
  const count = pinnedViewerRow
    ? countFor(PODIUM_CARD_MIN_WIDTH_PX + DIVIDER_WIDTH_PX + STRIP_GAP_PX * 2)
    : unreservedCount;
  const podiumRows = useMemo(() => boardRows.slice(0, count), [boardRows, count]);
  useSyncVerifyAddresses(podiumRows, setVerifyAddresses);

  if (isLoading && rows.length === 0) return <LeaderboardSkeleton count={STRIP_SKELETON_ROWS} />;
  if (boardRows.length === 0)
    return (
      <MarketPanelEmptyState
        {...EMPTY_LEADERBOARD_COPY[contestStatus]}
        slots={GHOST_PODIUM_RANKS.map(rank => (
          <GhostPodiumCard key={rank} rank={rank} />
        ))}
      />
    );

  return (
    <div ref={ref} className="flex items-stretch" style={{ gap: STRIP_GAP_PX }}>
      {podiumRows.map(row => (
        <PodiumCard key={row.address} row={row} formatPrice={formatPrice} />
      ))}
      {pinnedViewerRow && <div className="shrink-0 self-stretch bg-neutral-4" style={{ width: DIVIDER_WIDTH_PX }} />}
      {pinnedViewerRow ? <PodiumCard row={pinnedViewerRow} formatPrice={formatPrice} /> : null}
    </div>
  );
};

export default PodiumStrip;
