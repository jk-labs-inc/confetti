import CompactAmount from "@components/UI/CompactAmount";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { useNativePriceFormatter } from "@hooks/useNativePriceFormatter";
import usePriceCurveData from "@hooks/usePriceCurveData";
import { FC } from "react";
import StatDivider from "../StatDivider";

interface PriceStatProps {
  onClick: () => void;
}

const PriceStat: FC<PriceStatProps> = ({ onClick }) => {
  const { currentPriceNative, isLoading, isError } = usePriceCurveData();
  const formatPrice = useNativePriceFormatter();

  if (isError) return null;
  if (isLoading) {
    return (
      <>
        <StatDivider />
        <span className="h-3.5 w-24 shrink-0 animate-pulse rounded-full bg-neutral-2" />
      </>
    );
  }

  return (
    <>
      <StatDivider />
      <button
        type="button"
        onClick={onClick}
        aria-label="open the price chart"
        className="flex shrink-0 items-center gap-1 tabular-nums"
      >
        <b className="font-bold text-neutral-11">
          <CompactAmount value={formatPrice(currentPriceNative, { ceilingPrecision: true })} />
        </b>
        per vote
        <ChevronRightIcon className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
      </button>
    </>
  );
};

export default PriceStat;
