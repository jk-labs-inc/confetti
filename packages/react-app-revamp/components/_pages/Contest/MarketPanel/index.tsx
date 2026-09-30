import TabReveal from "@components/UI/TabReveal";
import { useHasLeaderboard } from "@hooks/useContestLeaderboard";
import { ContestStatus, useContestStatusStore } from "@hooks/useContestStatus/store";
import { FC, useState } from "react";
import FullBoardModal from "../FullBoard/components/Modal";
import ActivityRibbon from "./components/ActivityRibbon";
import MarketPanelHeader from "./components/Header";
import PodiumStrip from "./components/PodiumStrip";
import PriceCurveTab from "./components/PriceCurveTab";
import { MarketPanelTab } from "./constants";

const MarketPanel: FC = () => {
  const isVotingClosed = useContestStatusStore(state => state.contestStatus) === ContestStatus.VotingClosed;
  const hasLeaderboard = useHasLeaderboard();
  const [pickedTab, setTab] = useState<MarketPanelTab | null>(null);
  const tab = pickedTab ?? (isVotingClosed && hasLeaderboard ? MarketPanelTab.Leaderboard : MarketPanelTab.Activity);
  const [isFullBoardOpen, setIsFullBoardOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3 rounded-[20px] border border-neutral-4 bg-secondary-1 p-3">
      <MarketPanelHeader
        tab={tab}
        showLeaderboard={hasLeaderboard}
        onTabChange={setTab}
        onOpenFullBoard={() => setIsFullBoardOpen(true)}
      />
      <TabReveal tabKey={tab}>
        {tab === MarketPanelTab.Leaderboard ? (
          <PodiumStrip />
        ) : tab === MarketPanelTab.Activity ? (
          <ActivityRibbon />
        ) : (
          <PriceCurveTab />
        )}
      </TabReveal>
      {hasLeaderboard && <FullBoardModal isOpen={isFullBoardOpen} onClose={() => setIsFullBoardOpen(false)} />}
    </div>
  );
};

export default MarketPanel;
