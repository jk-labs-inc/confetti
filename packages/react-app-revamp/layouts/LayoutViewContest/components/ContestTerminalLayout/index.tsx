import ActivityTicker from "@components/_pages/Contest/ActivityTicker";
import MarketRail from "@components/_pages/Contest/MarketRail";
import VotingSidebar from "@components/_pages/Contest/VotingSidebar";
import { VotingWidgetLayout } from "@components/Voting/types";
import { FC } from "react";
import ContestEntriesColumn from "../ContestEntriesColumn";
import { VOTE_RAIL_SCROLL_CLASS_NAME } from "../ContestVoteRail/constants";

interface ContestTerminalLayoutProps {
  showVoteRail: boolean;
}

const THREE_COLUMN_GRID = "grid-cols-[minmax(0,9fr)_minmax(0,22fr)_minmax(0,9fr)]";
const TWO_COLUMN_GRID = "grid-cols-[minmax(0,9fr)_minmax(0,31fr)]";

const ContestTerminalLayout: FC<ContestTerminalLayoutProps> = ({ showVoteRail }) => (
  <div
    className={`flex-1 min-h-0 mt-3.5 wide:mt-5 grid grid-rows-[minmax(0,1fr)] gap-5 ${
      showVoteRail ? THREE_COLUMN_GRID : TWO_COLUMN_GRID
    }`}
  >
    <MarketRail />
    <div className="flex min-h-0 min-w-0 flex-col gap-2 wide:gap-2.5">
      <ActivityTicker />
      <ContestEntriesColumn scrollMode="viewport" />
    </div>
    {showVoteRail && (
      <aside className={`min-h-0 ${VOTE_RAIL_SCROLL_CLASS_NAME}`}>
        <VotingSidebar layout={VotingWidgetLayout.compact} />
      </aside>
    )}
  </div>
);

export default ContestTerminalLayout;
