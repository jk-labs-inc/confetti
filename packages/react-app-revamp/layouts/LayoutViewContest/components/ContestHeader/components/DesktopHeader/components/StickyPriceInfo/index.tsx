import useContestConfigStore from "@hooks/useContestConfig/store";
import { useCurrencyStore } from "@hooks/useCurrency/store";
import { convertToDisplayPrice } from "@hooks/useCurrency/useDisplayPrice";
import useNativeRates from "@hooks/useCurrency/useNativeRates";
import useCurrentPricePercentageIncrease from "@hooks/useCurrentPricePercentageIncrease";
import usePriceCurveData from "@hooks/usePriceCurveData";
import { useCountdownTimer } from "@hooks/useTimer";
import { FC, useMemo } from "react";
import { useShallow } from "zustand/shallow";

const StickyPriceInfo: FC = () => {
  const contestConfig = useContestConfigStore(useShallow(state => state.contestConfig));
  const displayCurrency = useCurrencyStore(state => state.displayCurrency);
  const { data: nativeRates } = useNativeRates();

  const {
    currentPrice,
    startPrice,
    priceCurveType,
    priceCurveUpdateInterval,
    endTimeMs,
    totalVotingMinutes,
    isLoading,
    isError,
  } = usePriceCurveData();

  const endTime = useMemo(() => new Date(endTimeMs), [endTimeMs]);
  const votingTimeLeft = useCountdownTimer(endTime);

  const { currentPricePercentageData } = useCurrentPricePercentageIncrease({
    address: contestConfig.address,
    abi: contestConfig.abi,
    chainId: contestConfig.chainId,
    costToVote: BigInt(startPrice),
    totalVotingMinutes,
    priceCurveType,
    votingTimeLeft,
  });

  const secondsUntilNextUpdate = priceCurveUpdateInterval > 0 ? votingTimeLeft % priceCurveUpdateInterval : 0;

  if (isLoading || isError || votingTimeLeft <= 0) return null;

  const { displayValue, displaySymbol } = convertToDisplayPrice(
    currentPrice.toString(),
    contestConfig.chainNativeCurrencySymbol,
    displayCurrency,
    nativeRates ?? {},
    {},
    undefined,
    { ceilingPrecision: true },
  );
  const formattedPrice = displaySymbol === "$" ? `$${displayValue}` : `${displayValue} ${displaySymbol}`;

  const percentage = currentPricePercentageData?.percentageIncrease ?? null;
  const isBelowThreshold = currentPricePercentageData?.isBelowThreshold ?? true;
  const showPct = !isBelowThreshold && percentage !== null;

  return (
    <div className="flex items-baseline gap-2 text-neutral-9 whitespace-nowrap">
      <span className="text-[24px]" aria-hidden>
        📈
      </span>
      <span className="text-[16px] md:text-[24px] text-neutral-11 font-bold md:font-normal">{formattedPrice}</span>
      <span className="text-[16px] text-neutral-9">per vote</span>
      <span className="text-[16px] text-neutral-9" aria-hidden>
        ·
      </span>
      <span className="text-[16px] text-neutral-9">
        increases{showPct ? ` ${percentage}%` : ""} in {secondsUntilNextUpdate}s
      </span>
    </div>
  );
};

export default StickyPriceInfo;
