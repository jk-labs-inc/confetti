import CompactAmount from "@components/UI/CompactAmount";
import GradientText from "@components/UI/GradientText";
import useNativeDisplayPrice from "@hooks/useCurrency/useNativeDisplayPrice";
import { FC } from "react";
import Skeleton from "react-loading-skeleton";
import WouldWinNowTooltip from "../WouldWinNowTooltip";

interface WouldWinNowBlockProps {
  amount: string;
  isBelowSpend: boolean;
}

const WouldWinNowBlock: FC<WouldWinNowBlockProps> = ({ amount, isBelowSpend }) => {
  const { formatted, isLoading } = useNativeDisplayPrice(amount);

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2">
        <GradientText textSizeClassName="text-[16px]" isFontSabo={false}>
          would win now
        </GradientText>
        <WouldWinNowTooltip isBelowSpend={isBelowSpend} />
      </div>
      {isLoading ? (
        <Skeleton width={100} height={24} baseColor="#706f78" highlightColor="#FFE25B" />
      ) : isBelowSpend ? (
        <span className="text-[24px] font-bold text-primary-10">
          <CompactAmount value={formatted} />
        </span>
      ) : (
        <GradientText textSizeClassName="text-[24px] font-bold" isFontSabo={false}>
          <CompactAmount value={formatted} />
        </GradientText>
      )}
    </div>
  );
};

export default WouldWinNowBlock;
