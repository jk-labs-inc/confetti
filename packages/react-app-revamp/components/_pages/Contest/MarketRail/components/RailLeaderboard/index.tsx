import { useContestLeaderboard, useSyncVerifyAddresses } from "@hooks/useContestLeaderboard";
import { useNativePriceFormatter } from "@hooks/useNativePriceFormatter";
import { FC, useMemo, useState } from "react";
import FullBoardModal from "../../../FullBoard/components/Modal";
import { RAIL_MAX_ROWS } from "../../constants";
import FullBoardButton from "../FullBoardButton";
import LeaderboardList from "../LeaderboardList";
import RoomHeader from "../RoomHeader";

const RailLeaderboard: FC = () => {
  const [isFullBoardOpen, setIsFullBoardOpen] = useState(false);
  const [verifyAddresses, setVerifyAddresses] = useState<string[]>([]);
  const formatPrice = useNativePriceFormatter();

  const { rows, viewerRow, isLoading } = useContestLeaderboard({ verifyAddresses });
  const railRows = useMemo(() => rows.filter(row => row.isOnBoard).slice(0, RAIL_MAX_ROWS), [rows]);
  useSyncVerifyAddresses(railRows, setVerifyAddresses);
  const pinnedViewerRow = viewerRow && !railRows.some(row => row.isViewer) ? viewerRow : null;

  return (
    <>
      <div className="shrink-0 border-t border-neutral-4" />
      <RoomHeader
        action={<FullBoardButton variant="label" label="see all" onClick={() => setIsFullBoardOpen(true)} />}
      />
      <LeaderboardList
        rows={railRows}
        pinnedViewerRow={pinnedViewerRow}
        formatPrice={formatPrice}
        isLoading={isLoading}
      />
      <FullBoardModal isOpen={isFullBoardOpen} onClose={() => setIsFullBoardOpen(false)} />
    </>
  );
};

export default RailLeaderboard;
