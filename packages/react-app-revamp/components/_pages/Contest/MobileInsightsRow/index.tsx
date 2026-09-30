import { ContestStatus, useContestStatusStore } from "@hooks/useContestStatus/store";
import { FC } from "react";
import { useMobileLeaderboard } from "../MobileLeaderboard/context";
import InsightsChip from "./components/InsightsChip";
import TopVoterSlot from "./components/TopVoterSlot";

interface MobileInsightsRowProps {
  onOpen: () => void;
}

const MobileInsightsRow: FC<MobileInsightsRowProps> = ({ onOpen }) => {
  const { topRows, isLoading, formatPrice } = useMobileLeaderboard();
  const isVotingOpen = useContestStatusStore(state => state.contestStatus) === ContestStatus.VotingOpen;

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="open insights: leaderboard, price curve and activity"
      className="flex h-9 w-full items-center overflow-hidden rounded-full border border-neutral-4 bg-neutral-2 text-left"
    >
      <span className="shrink-0 pl-3.5 pr-2.5 text-[11px] font-bold normal-case text-neutral-9">top voters</span>
      <span className="flex h-full min-w-0 flex-1 flex-wrap content-start items-center justify-evenly gap-x-3.5 overflow-hidden">
        {topRows.length > 0 ? (
          topRows.map(row => <TopVoterSlot key={row.address} row={row} formatPrice={formatPrice} />)
        ) : isLoading ? (
          <span className="flex h-full w-3/4 items-center">
            <span className="h-3.5 w-full animate-pulse rounded-full bg-neutral-4" />
          </span>
        ) : (
          <span className="flex h-full items-center truncate text-[12.5px] normal-case text-neutral-9">
            {isVotingOpen ? "be the first to back an entry" : "no voters yet"}
          </span>
        )}
      </span>
      <InsightsChip />
    </button>
  );
};

export default MobileInsightsRow;
