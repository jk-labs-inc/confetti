import { useContestLeaderboard, useSyncVerifyAddresses } from "@hooks/useContestLeaderboard";
import { useNativePriceFormatter } from "@hooks/useNativePriceFormatter";
import { FC, ReactNode, useMemo, useState } from "react";
import { BoardSort } from "../FullBoard/constants";
import { useBoardView } from "../FullBoard/useBoardView";
import { MobileLeaderboardContext, MobileLeaderboardValue } from "./context";

const INSIGHTS_TOP_VOTERS_COUNT = 3;

interface MobileLeaderboardProviderProps {
  isEnabled: boolean;
  children: ReactNode;
}

const MobileLeaderboardProvider: FC<MobileLeaderboardProviderProps> = ({ isEnabled, children }) => {
  const [sheetVerifyAddresses, setVerifyAddresses] = useState<string[]>([]);
  const [topVerifyAddresses, setTopVerifyAddresses] = useState<string[]>([]);
  const [sort, setSort] = useState<BoardSort>(BoardSort.Payout);
  const verifyAddresses = useMemo(
    () => [...sheetVerifyAddresses, ...topVerifyAddresses],
    [sheetVerifyAddresses, topVerifyAddresses],
  );
  const leaderboard = useContestLeaderboard({ verifyAddresses, enabled: isEnabled });
  const view = useBoardView({ rows: leaderboard.rows, viewerRow: leaderboard.viewerRow, sort });
  const formatPrice = useNativePriceFormatter();

  const topRows = useMemo(
    () => leaderboard.rows.filter(row => row.isOnBoard).slice(0, INSIGHTS_TOP_VOTERS_COUNT),
    [leaderboard.rows],
  );
  useSyncVerifyAddresses(topRows, setTopVerifyAddresses);

  const value = useMemo<MobileLeaderboardValue>(
    () => ({ ...leaderboard, formatPrice, setVerifyAddresses, sort, setSort, view, topRows }),
    [leaderboard, formatPrice, sort, view, topRows],
  );

  return <MobileLeaderboardContext.Provider value={value}>{children}</MobileLeaderboardContext.Provider>;
};

export default MobileLeaderboardProvider;
