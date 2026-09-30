import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { useContestPoolDisplay } from "@hooks/useContestPoolDisplay";
import { FC } from "react";
import PoolStat from "./components/PoolStat";
import PriceStat from "./components/PriceStat";
import StatDivider from "./components/StatDivider";
import TimeLeftStat from "./components/TimeLeftStat";

interface MobileStatLineProps {
  onOpenPriceSheet: () => void;
}

const MobileStatLine: FC<MobileStatLineProps> = ({ onOpenPriceSheet }) => {
  const pool = useContestPoolDisplay();
  const showPool = pool.hasRewards || pool.isLoading;

  return (
    <button
      type="button"
      onClick={onOpenPriceSheet}
      className="flex h-9 w-full min-w-0 items-center gap-2 whitespace-nowrap rounded-full border border-neutral-4 bg-neutral-2 pl-3.5 pr-2.5 text-left text-[13px] normal-case text-neutral-9"
    >
      {showPool ? (
        <>
          <PoolStat pool={pool} />
          <StatDivider />
        </>
      ) : null}
      <TimeLeftStat />
      <PriceStat />
      <ChevronRightIcon className="ml-auto h-3.5 w-3.5 shrink-0 text-neutral-11" strokeWidth={2.5} aria-hidden />
    </button>
  );
};

export default MobileStatLine;
