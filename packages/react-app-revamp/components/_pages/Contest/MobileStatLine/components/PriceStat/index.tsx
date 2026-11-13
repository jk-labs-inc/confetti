import CompactAmount from "@components/UI/CompactAmount";
import { useNativePriceFormatter } from "@hooks/useNativePriceFormatter";
import usePriceCurveData from "@hooks/usePriceCurveData";
import { FC } from "react";

const PriceStat: FC = () => {
  const { currentPriceNative, isLoading, isError } = usePriceCurveData();
  const formatPrice = useNativePriceFormatter();

  if (isError) return null;
  if (isLoading) return <span className="h-3.5 w-20 shrink-0 animate-pulse rounded-full bg-neutral-4" />;

  return (
    <span className="min-w-0 truncate tabular-nums">
      <b className="text-[14px] font-bold text-neutral-11">
        <CompactAmount value={formatPrice(currentPriceNative, { ceilingPrecision: true })} />
      </b>
      /vote
    </span>
  );
};

export default PriceStat;
