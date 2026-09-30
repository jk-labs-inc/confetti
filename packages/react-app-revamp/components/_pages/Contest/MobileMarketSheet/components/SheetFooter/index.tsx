import { LeaderboardRow as LeaderboardRowData } from "@hooks/useContestLeaderboard";
import { useLeaderboardEntryTitles } from "@hooks/useLeaderboardEntryTitles";
import { useWallet } from "@hooks/useWallet";
import { FC } from "react";
import LeaderboardRow from "../../../MarketRail/components/LeaderboardRow";
import { useMobileLeaderboard } from "../../../MobileLeaderboard/context";

const NO_ROWS: LeaderboardRowData[] = [];

const SheetFooter: FC = () => {
  const { view, formatPrice } = useMobileLeaderboard();
  const { isConnected } = useWallet();
  const pinnedRow = view.pinnedViewerRow;
  const entryTitleOf = useLeaderboardEntryTitles(NO_ROWS, pinnedRow);

  if (!isConnected || !pinnedRow) return null;

  return (
    <div className="-mx-4 flex shrink-0 flex-col border-t border-white/8 px-4 pb-4 pt-2">
      <LeaderboardRow row={pinnedRow} entryTitle={entryTitleOf(pinnedRow)} formatPrice={formatPrice} />
    </div>
  );
};

export default SheetFooter;
