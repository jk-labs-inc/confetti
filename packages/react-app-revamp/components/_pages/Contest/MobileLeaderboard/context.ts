import { ContestLeaderboard, LeaderboardRow } from "@hooks/useContestLeaderboard";
import { NativePriceFormatter } from "@hooks/useNativePriceFormatter";
import { createContext, useContext } from "react";
import { BoardSort } from "../FullBoard/constants";
import { BoardView } from "../FullBoard/useBoardView";

export interface MobileLeaderboardValue extends ContestLeaderboard {
  formatPrice: NativePriceFormatter;
  setVerifyAddresses: (addresses: string[]) => void;
  sort: BoardSort;
  setSort: (sort: BoardSort) => void;
  view: BoardView;
  topRows: LeaderboardRow[];
}

export const MobileLeaderboardContext = createContext<MobileLeaderboardValue | null>(null);

export const useMobileLeaderboardOptional = (): MobileLeaderboardValue | null => useContext(MobileLeaderboardContext);

export const useMobileLeaderboard = (): MobileLeaderboardValue => {
  const value = useContext(MobileLeaderboardContext);
  if (!value) throw new Error("useMobileLeaderboard must be used inside MobileLeaderboardProvider");
  return value;
};
