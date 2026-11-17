import ContestTimingTag from "@components/_pages/Contest/components/ContestTimingTag";
import RewardsSticker from "@components/UI/RewardsSticker";
import RewardsStickerSkeleton from "@components/UI/RewardsSticker/components/RewardsStickerSkeleton";
import { useContestPoolDisplay } from "@hooks/useContestPoolDisplay";
import { RewardsStickerLabeledSize } from "@components/UI/RewardsSticker/types";
import { FC } from "react";

interface HeadlineStickersProps {
  stickerSize: RewardsStickerLabeledSize;
  className?: string;
}

const HeadlineStickers: FC<HeadlineStickersProps> = ({ stickerSize, className = "" }) => {
  const pool = useContestPoolDisplay();

  return (
    <div className={`flex shrink-0 flex-col items-end whitespace-nowrap pl-3 ${className}`}>
      {pool.status === "loading" && <RewardsStickerSkeleton size={stickerSize} />}
      {pool.status === "ready" && (
        <RewardsSticker
          size={stickerSize}
          items={pool.tokenItems}
          chainName={pool.chainName}
          phase={pool.phase}
          audience={pool.audience}
        />
      )}
      <ContestTimingTag className={pool.status === "empty" ? undefined : "-mt-1 mr-2"} />
    </div>
  );
};

export default HeadlineStickers;
