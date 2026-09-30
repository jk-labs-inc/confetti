import MarketPanel from "@components/_pages/Contest/MarketPanel";
import { FC } from "react";
import ContestEntriesColumn from "../ContestEntriesColumn";
import StickyVoteRail from "../ContestVoteRail/StickyVoteRail";

interface ContestTwoColumnLayoutProps {
  showVoteRail: boolean;
}

const ContestTwoColumnLayout: FC<ContestTwoColumnLayoutProps> = ({ showVoteRail }) => (
  <div
    className={`mt-3 grid gap-5 items-start ${
      showVoteRail ? "grid-cols-[minmax(0,1fr)_340px]" : "grid-cols-[minmax(0,1fr)]"
    }`}
  >
    <div className="flex flex-col gap-3 min-w-0">
      <MarketPanel />
      <ContestEntriesColumn scrollMode="page" />
    </div>
    {showVoteRail && <StickyVoteRail />}
  </div>
);

export default ContestTwoColumnLayout;
