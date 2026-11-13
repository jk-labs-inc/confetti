import ContestClock from "@components/_pages/Contest/components/ContestClock";
import RewardsSticker from "@components/UI/RewardsSticker";
import RewardsStickerSkeleton from "@components/UI/RewardsSticker/components/RewardsStickerSkeleton";
import { useContestPoolDisplay } from "@hooks/useContestPoolDisplay";
import { FC } from "react";

interface HeadlinePillProps {
  className?: string;
}

const PILL_CLASS_NAME =
  "flex h-11 items-center whitespace-nowrap rounded-[40px] border border-neutral-10 bg-true-black";

const HeadlinePill: FC<HeadlinePillProps> = ({ className = "" }) => {
  const pool = useContestPoolDisplay();

  if (pool.status === "empty") {
    return (
      <div className={`shrink-0 ${className}`}>
        <div className={`${PILL_CLASS_NAME} px-4`}>
          <ContestClock />
        </div>
      </div>
    );
  }

  return (
    <div className={`shrink-0 pl-3 ${className}`}>
      <div className={PILL_CLASS_NAME}>
        <div className="flex items-center pr-4">
          {pool.status === "loading" ? (
            <RewardsStickerSkeleton size="headline" />
          ) : (
            <RewardsSticker
              size="headline"
              items={pool.tokenItems}
              chainName={pool.chainName}
              phase={pool.phase}
              audience={pool.audience}
            />
          )}
        </div>
        <span aria-hidden="true" className="w-px self-stretch bg-primary-3" />
        <div className="pl-3.5 pr-4.5">
          <ContestClock />
        </div>
      </div>
    </div>
  );
};

export default HeadlinePill;
