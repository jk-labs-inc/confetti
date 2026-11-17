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

  return (
    <div className="flex min-h-9 items-center justify-between gap-3">
      {pool.status !== "empty" && (
        <span className="flex shrink-0 pl-1.5">
          {pool.status === "loading" ? (
            <RewardsStickerSkeleton size="stat" />
          ) : (
            <RewardsSticker size="stat" items={pool.tokenItems} chainName={pool.chainName} phase={pool.phase} />
          )}
        </span>
      )}
      <button
        type="button"
        onClick={onOpenPriceSheet}
        className="ml-auto flex h-9 min-w-0 items-center gap-1 whitespace-nowrap text-left text-[13px] normal-case text-neutral-9"
      >
        <PriceStat />
        <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-neutral-11" strokeWidth={2.5} aria-hidden />
      </button>
    </div>
  );
};

export default MobileStatLine;
