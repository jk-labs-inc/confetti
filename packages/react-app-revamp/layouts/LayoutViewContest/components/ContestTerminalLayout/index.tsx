import ActivityTicker from "@components/_pages/Contest/ActivityTicker";
import MarketRail from "@components/_pages/Contest/MarketRail";
import VotingSidebar from "@components/_pages/Contest/VotingSidebar";
import { VotingWidgetLayout } from "@components/Voting/types";
import { useProposalStore } from "@hooks/useProposal/store";
import { FC } from "react";
import ContestEntriesColumn from "../ContestEntriesColumn";
import { VOTE_RAIL_SCROLL_CLASS_NAME } from "../ContestVoteRail/constants";

interface ContestTerminalLayoutProps {
  showVoteRail: boolean;
}

const FEW_ENTRIES_MAX_COUNT = 2;
const THREE_COLUMN_GRID =
  "grid-cols-[minmax(0,9fr)_minmax(0,22fr)_minmax(0,9fr)] 4xl:grid-cols-[296px_minmax(0,1fr)_296px]";
const FEW_ENTRIES_THREE_COLUMN_GRID =
  "grid-cols-[minmax(0,9fr)_minmax(0,22fr)_minmax(0,9fr)] 4xl:grid-cols-[minmax(296px,9fr)_minmax(0,25fr)_minmax(296px,9fr)]";
const TWO_COLUMN_GRID = "grid-cols-[minmax(0,9fr)_minmax(0,31fr)] 4xl:grid-cols-[296px_minmax(0,1fr)]";

const ContestTerminalLayout: FC<ContestTerminalLayoutProps> = ({ showVoteRail }) => {
  const hasFewEntries = useProposalStore(state => state.submissionsCount) <= FEW_ENTRIES_MAX_COUNT;
  const threeColumnGrid = hasFewEntries ? FEW_ENTRIES_THREE_COLUMN_GRID : THREE_COLUMN_GRID;

  return (
    <div
      className={`flex-1 min-h-0 mt-3.5 wide:mt-5 grid grid-rows-[minmax(0,1fr)] gap-5 ${
        showVoteRail ? threeColumnGrid : TWO_COLUMN_GRID
      }`}
    >
      <MarketRail />
      <div className="flex min-h-0 min-w-0 flex-col">
        <ContestEntriesColumn scrollMode="viewport" header={<ActivityTicker />} />
      </div>
      {showVoteRail && (
        <aside className={`min-h-0 ${VOTE_RAIL_SCROLL_CLASS_NAME}`}>
          <VotingSidebar layout={VotingWidgetLayout.compact} />
        </aside>
      )}
    </div>
  );
};

export default ContestTerminalLayout;
