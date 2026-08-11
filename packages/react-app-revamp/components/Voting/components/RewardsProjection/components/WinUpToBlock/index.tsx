import CompactAmount from "@components/UI/CompactAmount";
import GradientText from "@components/UI/GradientText";
import useNativeDisplayPrice from "@hooks/useCurrency/useNativeDisplayPrice";
import { FC } from "react";
import Skeleton from "react-loading-skeleton";
import VotingWidgetRewardsProjectionTooltip from "../Tooltip";

interface WinUpToBlockProps {
  amount: string;
  centered?: boolean;
}

const WinUpToBlock: FC<WinUpToBlockProps> = ({ amount, centered }) => {
  const { formatted, isLoading } = useNativeDisplayPrice(amount);

  return (
    <div className={centered ? "mx-auto flex flex-col items-center" : "ml-auto flex flex-col items-end"}>
      <div className="flex items-center gap-2">
        <GradientText textSizeClassName="text-[16px]" isFontSabo={false}>
          win up to
        </GradientText>
        <VotingWidgetRewardsProjectionTooltip />
      </div>
      {isLoading ? (
        <Skeleton width={100} height={24} baseColor="#706f78" highlightColor="#FFE25B" />
      ) : (
        <GradientText textSizeClassName="text-[24px] font-bold uppercase" isFontSabo={false}>
          <CompactAmount value={formatted} />
        </GradientText>
      )}
    </div>
  );
};

export default WinUpToBlock;
