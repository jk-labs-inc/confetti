import FitText from "@components/VotingActionBar/FitText";
import useNativeDisplayPrice from "@hooks/useCurrency/useNativeDisplayPrice";
import { FC } from "react";

interface PushToFirstStatProps {
  remainingToFirst: string;
  onFill: () => void;
}

const PushToFirstStat: FC<PushToFirstStatProps> = ({ remainingToFirst, onFill }) => {
  const { formatted } = useNativeDisplayPrice(remainingToFirst, { ceilingPrecision: true });

  return (
    <button onClick={onFill} className="flex min-w-0 flex-1 flex-col items-center leading-tight">
      <span className="whitespace-nowrap text-[11px] text-neutral-9">
        push to 1<sup>st</sup>
      </span>
      <FitText
        text={formatted}
        min={8}
        max={20}
        group
        compactZeros
        className="block w-full overflow-hidden whitespace-nowrap text-center font-bold text-neutral-11"
      />
    </button>
  );
};

export default PushToFirstStat;
