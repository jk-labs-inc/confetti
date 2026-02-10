import VotingQualifierError from "@components/_pages/Contest/components/StickyCards/components/VotingQualifier/shared/Error";
import VotingQualifierSkeleton from "@components/_pages/Contest/components/StickyCards/components/VotingQualifier/shared/Skeleton";
import { useContestStore } from "@hooks/useContest/store";
import useContestConfigStore from "@hooks/useContestConfig/store";
import useDisplayPrice from "@hooks/useCurrency/useDisplayPrice";
import usePriceCurveMultiple from "@hooks/usePriceCurveMultiple";
import { calculateEndPrice } from "lib/priceCurve";
import { FC } from "react";
import { useMediaQuery } from "react-responsive";
import { formatEther } from "viem";
import { useShallow } from "zustand/shallow";

const VotingQualifierAnyoneCanVoteExponentialEndPrice: FC = () => {
  const { contestConfig } = useContestConfigStore(useShallow(state => state));
  const { costToVote } = useContestStore(
    useShallow(state => ({
      costToVote: state.charge.costToVote,
    })),
  );
  const { priceCurveMultiple, isLoading, isError, refetch } = usePriceCurveMultiple({
    address: contestConfig.address,
    abi: contestConfig.abi,
    chainId: contestConfig.chainId,
  });

  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  const startPriceRaw = formatEther(BigInt(costToVote ?? 0));
  const endPriceRaw = formatEther(calculateEndPrice(costToVote ?? 0, Number(priceCurveMultiple)));

  const { displayValue: startDisplay, displaySymbol, secondaryValue: startSecondary, secondarySymbol } =
    useDisplayPrice(startPriceRaw, contestConfig.chainNativeCurrencySymbol);
  const { displayValue: endDisplay, secondaryValue: endSecondary } = useDisplayPrice(
    endPriceRaw,
    contestConfig.chainNativeCurrencySymbol,
  );

  if (isLoading) return <VotingQualifierSkeleton />;
  if (isError) return <VotingQualifierError onClick={() => refetch()} />;

  const showSecondary = !isMobile && startSecondary && endSecondary && secondarySymbol;

  const formatRangeValue = (value: string, symbol: string) => (symbol === "$" ? `$${value}` : value);

  return (
    <p className="text-[16px] md:text-[24px] text-neutral-11 font-bold">
      {formatRangeValue(startDisplay, displaySymbol)} → {formatRangeValue(endDisplay, displaySymbol)}
      {displaySymbol !== "$" && (
        <span className="text-[16px] md:text-[24px] text-neutral-9 uppercase"> {displaySymbol}</span>
      )}
      {showSecondary && (
        <span className="text-[12px] text-neutral-9 font-bold ml-1.5">
          | {formatRangeValue(startSecondary, secondarySymbol)} → {formatRangeValue(endSecondary, secondarySymbol)}
          {secondarySymbol !== "$" && <span className="uppercase"> {secondarySymbol}</span>}
        </span>
      )}
    </p>
  );
};

export default VotingQualifierAnyoneCanVoteExponentialEndPrice;
