import CompactAmount from "@components/UI/CompactAmount";
import GradientText from "@components/UI/GradientText";
import { VotingWidgetLayout } from "@components/Voting/types";
import useNativeDisplayPrice from "@hooks/useCurrency/useNativeDisplayPrice";
import { FC } from "react";
import Skeleton from "react-loading-skeleton";
import { PROJECTION_LAYOUT_CLASS_NAMES } from "../../constants";

interface PushToFirstBlockProps {
  remainingToFirst: string;
  layout?: VotingWidgetLayout;
}

const PushToFirstBlock: FC<PushToFirstBlockProps> = ({ remainingToFirst, layout = VotingWidgetLayout.regular }) => {
  const { formatted, isLoading } = useNativeDisplayPrice(remainingToFirst, { ceilingPrecision: true });
  const classNames = PROJECTION_LAYOUT_CLASS_NAMES[layout];

  return (
    <div className="flex flex-col">
      <GradientText textSizeClassName={classNames.label} isFontSabo={false}>
        push to 1<sup>st</sup>
      </GradientText>
      {isLoading ? (
        <Skeleton width={100} height={24} baseColor="#706f78" highlightColor="#FFE25B" />
      ) : (
        <span className={`${classNames.value} font-bold text-neutral-11`}>
          <CompactAmount value={formatted} />
        </span>
      )}
    </div>
  );
};

export default PushToFirstBlock;
