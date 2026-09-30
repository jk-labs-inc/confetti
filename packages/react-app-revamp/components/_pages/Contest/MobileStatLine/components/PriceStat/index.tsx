import CompactAmount from "@components/UI/CompactAmount";
import { useNativePriceFormatter } from "@hooks/useNativePriceFormatter";
import usePriceCurveData from "@hooks/usePriceCurveData";
import { FC } from "react";
import StatDivider from "../StatDivider";

const PriceStat: FC = () => {
  const { currentPriceNative, isLoading, isError } = usePriceCurveData();
  const formatPrice = useNativePriceFormatter();

  if (isError) return null;
  if (isLoading) {
    return (
      <>
        <StatDivider />
        <span className="h-3.5 w-24 shrink-0 animate-pulse rounded-full bg-neutral-4" />
      </>
    );
  }

  return (
    <>
      <StatDivider />
      <span className="shrink-0 tabular-nums">
        <b className="font-bold text-neutral-11">
          <CompactAmount value={formatPrice(currentPriceNative, { ceilingPrecision: true })} />
        </b>{" "}
        per vote
      </span>
    </>
  );
};

export default PriceStat;
