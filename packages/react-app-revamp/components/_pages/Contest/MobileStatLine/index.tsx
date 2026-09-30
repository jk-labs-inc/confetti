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
    <div className="flex h-5 min-w-0 items-center gap-2 whitespace-nowrap text-[13px] normal-case text-neutral-9">
      {showPool ? (
        <>
          <PoolStat pool={pool} />
          <StatDivider />
        </>
      ) : null}
      <TimeLeftStat />
      <PriceStat onClick={onOpenPriceSheet} />
    </div>
  );
};

export default MobileStatLine;
