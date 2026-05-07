import VotingQualifierError from "@components/_pages/Contest/components/StickyCards/components/VotingQualifier/shared/Error";
import VotingQualifierSkeleton from "@components/_pages/Contest/components/StickyCards/components/VotingQualifier/shared/Skeleton";
import { useContestStore } from "@hooks/useContest/store";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { PriceCurveType } from "@hooks/useDeployContest/types";
import useDisplayPrice from "@hooks/useCurrency/useDisplayPrice";
import usePriceCurveMultiple from "@hooks/usePriceCurveMultiple";
import { calculateEndPriceForType } from "lib/priceCurve";
import { FC } from "react";
import { formatEther } from "viem";
import { useShallow } from "zustand/shallow";

interface VotingQualifierAnyoneCanVoteExponentialEndPriceProps {
  priceCurveType?: PriceCurveType;
}

const VotingQualifierAnyoneCanVoteExponentialEndPrice: FC<VotingQualifierAnyoneCanVoteExponentialEndPriceProps> = ({
  priceCurveType = PriceCurveType.Exponential,
}) => {
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

  const startPriceRaw = formatEther(BigInt(costToVote ?? 0));
  const endPriceRaw = formatEther(
    calculateEndPriceForType(priceCurveType, costToVote ?? 0, Number(priceCurveMultiple)),
  );

  const { displayValue: startDisplay, displaySymbol, isLoading: isPriceLoading } = useDisplayPrice(
    startPriceRaw,
    contestConfig.chainNativeCurrencySymbol,
  );
  const { displayValue: endDisplay } = useDisplayPrice(endPriceRaw, contestConfig.chainNativeCurrencySymbol);

  if (isLoading || isPriceLoading) return <VotingQualifierSkeleton />;
  if (isError) return <VotingQualifierError onClick={() => refetch()} />;

  const isUsd = displaySymbol === "$";

  return (
    <p className="text-[16px] md:text-[24px] text-neutral-11 font-bold">
      {isUsd ? `$${startDisplay} - $${endDisplay}` : `${startDisplay} - ${endDisplay}`}
      {!isUsd && <span className="text-[16px] md:text-[24px] text-neutral-9 uppercase"> {displaySymbol}</span>}
    </p>
  );
};

export default VotingQualifierAnyoneCanVoteExponentialEndPrice;
