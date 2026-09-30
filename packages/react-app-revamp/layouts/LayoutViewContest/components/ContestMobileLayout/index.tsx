import MobileInsightsRow from "@components/_pages/Contest/MobileInsightsRow";
import MobileLeaderboardProvider from "@components/_pages/Contest/MobileLeaderboard/Provider";
import MobileMarketSheet from "@components/_pages/Contest/MobileMarketSheet";
import MobileStatLine from "@components/_pages/Contest/MobileStatLine";
import { MarketSheetSegment } from "@components/_pages/Contest/MobileMarketSheet/constants";
import VotingActionBar from "@components/VotingActionBar";
import { useHasLeaderboard } from "@hooks/useContestLeaderboard";
import { ContestStateEnum, useContestStateStore } from "@hooks/useContestState/store";
import { ContestStatus, useContestStatusStore } from "@hooks/useContestStatus/store";
import { FC, useCallback, useState } from "react";
import ContestMobileEntryCard from "./components/ContestMobileEntryCard";

interface SheetState {
  isOpen: boolean;
  segment: MarketSheetSegment;
}

const CLOSED_SHEET: SheetState = { isOpen: false, segment: MarketSheetSegment.Leaderboard };

const ContestMobileLayout: FC = () => {
  const isVotingOpen = useContestStatusStore(state => state.contestStatus) === ContestStatus.VotingOpen;
  const isCanceled = useContestStateStore(state => state.contestState) === ContestStateEnum.Canceled;
  const hasLeaderboard = useHasLeaderboard();
  const [sheet, setSheet] = useState<SheetState>(CLOSED_SHEET);

  const openSheet = useCallback((segment: MarketSheetSegment) => setSheet({ isOpen: true, segment }), []);
  const closeSheet = useCallback(() => setSheet(prev => ({ ...prev, isOpen: false })), []);
  const changeSegment = useCallback((segment: MarketSheetSegment) => setSheet(prev => ({ ...prev, segment })), []);

  return (
    <MobileLeaderboardProvider isEnabled={hasLeaderboard}>
      <div className="animate-fade-in mt-3 flex flex-col gap-3">
        <MobileStatLine onOpenPriceSheet={() => openSheet(MarketSheetSegment.Price)} />
        {hasLeaderboard && <MobileInsightsRow onOpen={() => openSheet(MarketSheetSegment.Leaderboard)} />}
        <ContestMobileEntryCard />
        {isVotingOpen && !isCanceled && <VotingActionBar />}
      </div>
      <MobileMarketSheet
        isOpen={sheet.isOpen}
        segment={sheet.segment}
        showLeaderboard={hasLeaderboard}
        onSegmentChange={changeSegment}
        onClose={closeSheet}
      />
    </MobileLeaderboardProvider>
  );
};

export default ContestMobileLayout;
