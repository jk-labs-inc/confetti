import CompactAmount from "@components/UI/CompactAmount";
import GradientText from "@components/UI/GradientText";
import useNativeDisplayPrice from "@hooks/useCurrency/useNativeDisplayPrice";
import { FC } from "react";
import Skeleton from "react-loading-skeleton";

interface PushToFirstBlockProps {
  remainingToFirst: string;
}

const PushToFirstBlock: FC<PushToFirstBlockProps> = ({ remainingToFirst }) => {
  const { formatted, isLoading } = useNativeDisplayPrice(remainingToFirst);

  return (
    <div className="flex flex-col">
      <GradientText textSizeClassName="text-[16px]" isFontSabo={false}>
        push to 1<sup>st</sup>
      </GradientText>
      {isLoading ? (
        <Skeleton width={100} height={24} baseColor="#706f78" highlightColor="#FFE25B" />
      ) : (
        <span className="text-[24px] font-bold text-neutral-11">
          <CompactAmount value={formatted} />
        </span>
      )}
    </div>
  );
};

export default PushToFirstBlock;
