import EndedDot from "@components/UI/LivePingDot/EndedDot";
import LivePingDot from "@components/UI/LivePingDot";
import SegmentedControl from "@components/UI/SegmentedControl";
import { ContestStatus, useContestStatusStore } from "@hooks/useContestStatus/store";
import { FC, useMemo } from "react";
import FullBoardButton from "../../../MarketRail/components/FullBoardButton";
import PriceHeader from "../../../MarketRail/components/PriceHeader";
import { MarketPanelTab } from "../../constants";

interface MarketPanelHeaderProps {
  tab: MarketPanelTab;
  showLeaderboard: boolean;
  onTabChange: (tab: MarketPanelTab) => void;
  onOpenFullBoard: () => void;
}

const MarketPanelHeader: FC<MarketPanelHeaderProps> = ({ tab, showLeaderboard, onTabChange, onOpenFullBoard }) => {
  const contestStatus = useContestStatusStore(state => state.contestStatus);
  const isVotingOpen = contestStatus === ContestStatus.VotingOpen;
  const isVotingClosed = contestStatus === ContestStatus.VotingClosed;
  const tabOptions = useMemo(() => {
    const options = isVotingClosed
      ? [
          { value: MarketPanelTab.Leaderboard, label: "final standings" },
          { value: MarketPanelTab.Activity, label: "past activity", leading: <EndedDot /> },
          { value: MarketPanelTab.PriceCurve, label: "price curve" },
        ]
      : [
          { value: MarketPanelTab.Activity, label: "activity", leading: isVotingOpen ? <LivePingDot /> : undefined },
          { value: MarketPanelTab.Leaderboard, label: "leaderboard" },
          { value: MarketPanelTab.PriceCurve, label: "price curve" },
        ];
    return showLeaderboard ? options : options.filter(option => option.value !== MarketPanelTab.Leaderboard);
  }, [isVotingOpen, isVotingClosed, showLeaderboard]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <SegmentedControl options={tabOptions} value={tab} onChange={onTabChange} size="md" />
      <PriceHeader />
      {tab === MarketPanelTab.Leaderboard && (
        <div className="ml-auto">
          <FullBoardButton variant="pill" onClick={onOpenFullBoard} />
        </div>
      )}
    </div>
  );
};

export default MarketPanelHeader;
