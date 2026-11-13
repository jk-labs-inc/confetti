import RewardsSticker from "@components/UI/RewardsSticker";
import RewardsStickerSkeleton from "@components/UI/RewardsSticker/components/RewardsStickerSkeleton";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { useContestPoolDisplay } from "@hooks/useContestPoolDisplay";
import { FC } from "react";
import PriceStat from "./components/PriceStat";

interface MobileStatLineProps {
  onOpenPriceSheet: () => void;
}

const MobileStatLine: FC<MobileStatLineProps> = ({ onOpenPriceSheet }) => {
  const pool = useContestPoolDisplay();
  const hasPot = pool.status !== "empty";

  const priceButton = (
    <button
      type="button"
      onClick={onOpenPriceSheet}
      className={`flex h-full min-w-0 flex-1 items-center justify-between gap-1.5 pr-2.5 text-left normal-case ${hasPot ? "pl-2.5" : "pl-3.5"}`}
    >
      <PriceStat />
      <ChevronRightIcon className="ml-auto h-3.5 w-3.5 shrink-0 text-neutral-11" strokeWidth={2.5} aria-hidden />
    </button>
  );

  return (
    <div className={hasPot ? "pl-2" : undefined}>
      <div className="flex h-9 w-full min-w-0 items-center whitespace-nowrap rounded-full border border-neutral-10 bg-true-black text-[13px] text-neutral-9">
        {pool.status === "loading" && <RewardsStickerSkeleton size="bar" />}
        {pool.status === "ready" && (
          <RewardsSticker
            size="bar"
            items={pool.tokenItems}
            chainName={pool.chainName}
            phase={pool.phase}
            audience={pool.audience}
          />
        )}
        {hasPot && <span aria-hidden="true" className="ml-2.5 w-px self-stretch bg-primary-3" />}
        {priceButton}
      </div>
    </div>
  );
};

export default MobileStatLine;
