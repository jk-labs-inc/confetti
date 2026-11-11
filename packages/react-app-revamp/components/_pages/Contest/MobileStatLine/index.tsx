import ContestRewardsInfo from "@components/_pages/Contest/components/RewardsInfo";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { FC } from "react";
import PriceStat from "./components/PriceStat";
import TimeLeftStat from "./components/TimeLeftStat";

interface MobileStatLineProps {
  onOpenPriceSheet: () => void;
}

const MobileStatLine: FC<MobileStatLineProps> = ({ onOpenPriceSheet }) => (
  <button
    type="button"
    onClick={onOpenPriceSheet}
    className="flex h-9 w-full min-w-0 items-center gap-2 whitespace-nowrap rounded-full border border-neutral-4 bg-neutral-2 pl-3.5 pr-2.5 text-left text-[13px] normal-case text-neutral-9"
  >
    <ContestRewardsInfo variant="stat" className="-my-2 -ml-5" />
    <TimeLeftStat />
    <PriceStat />
    <ChevronRightIcon className="ml-auto h-3.5 w-3.5 shrink-0 text-neutral-11" strokeWidth={2.5} aria-hidden />
  </button>
);

export default MobileStatLine;
