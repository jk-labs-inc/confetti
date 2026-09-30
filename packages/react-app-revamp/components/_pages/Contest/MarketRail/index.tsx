import { useHasLeaderboard } from "@hooks/useContestLeaderboard";
import { FC } from "react";
import RailLeaderboard from "./components/RailLeaderboard";
import RailPriceCurve from "./components/RailPriceCurve";

const MarketRail: FC = () => {
  const hasLeaderboard = useHasLeaderboard();

  return (
    <div className="flex min-h-0 max-h-full self-start flex-col gap-2 wide:gap-3 overflow-y-auto overflow-x-hidden overscroll-contain no-scrollbar rounded-[20px] wide:rounded-3xl border border-neutral-4 bg-secondary-1 p-3 wide:p-3.5">
      <RailPriceCurve />
      {hasLeaderboard && <RailLeaderboard />}
    </div>
  );
};

export default MarketRail;
