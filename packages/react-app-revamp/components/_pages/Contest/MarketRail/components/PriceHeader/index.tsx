import InfoButton from "@components/PriceCurve/components/InfoButton";
import CompactAmount from "@components/UI/CompactAmount";
import { ContestStatus, useContestStatusStore } from "@hooks/useContestStatus/store";
import { useNativePriceFormatter } from "@hooks/useNativePriceFormatter";
import usePriceCurveData from "@hooks/usePriceCurveData";
import { FC } from "react";
import PriceUpdateCountdown from "./PriceUpdateCountdown";

const INFO_BUTTON_CLASS_NAME = "self-center text-neutral-9 hover:text-neutral-11";
const INFO_ICON_CLASS_NAME = "h-4 w-4";

const PriceHeader: FC = () => {
  const { currentPriceNative, isLoading, isError } = usePriceCurveData();
  const formatPrice = useNativePriceFormatter();
  const isVotingClosed = useContestStatusStore(state => state.contestStatus) === ContestStatus.VotingClosed;

  if (isError || isVotingClosed) return null;
  if (isLoading) return <div className="h-5 w-28 shrink-0 animate-pulse rounded-md bg-neutral-2" />;

  const priceText = formatPrice(currentPriceNative, { ceilingPrecision: true });

  return (
    <p className="flex items-baseline gap-1.5 whitespace-nowrap text-[13px] text-neutral-11">
      <span className="font-bold tabular-nums">
        <CompactAmount value={priceText} />
      </span>
      <span>per vote</span>
      <PriceUpdateCountdown />
      <InfoButton buttonClassName={INFO_BUTTON_CLASS_NAME} iconClassName={INFO_ICON_CLASS_NAME} />
    </p>
  );
};

export default PriceHeader;
