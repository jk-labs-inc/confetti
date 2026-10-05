import { useWallet } from "@hooks/useWallet";
import { FC } from "react";
import LeaderboardRow from "../../../MarketRail/components/LeaderboardRow";
import { useMobileLeaderboard } from "../../../MobileLeaderboard/context";

const SheetFooter: FC = () => {
  const { view, formatPrice } = useMobileLeaderboard();
  const { isConnected } = useWallet();
  const pinnedRow = view.pinnedViewerRow;

  if (!isConnected || !pinnedRow) return null;

  return (
    <div className="-mx-4 flex shrink-0 flex-col border-t border-white/8 px-4 pb-4 pt-2">
      <LeaderboardRow row={pinnedRow} formatPrice={formatPrice} />
    </div>
  );
};

export default SheetFooter;
