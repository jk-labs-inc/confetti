import VotingQualifierError from "@components/_pages/Contest/components/StickyCards/components/VotingQualifier/shared/Error";
import VotingQualifierSkeleton from "@components/_pages/Contest/components/StickyCards/components/VotingQualifier/shared/Skeleton";
import { useContestStore } from "@hooks/useContest/store";
import useContestConfigStore from "@hooks/useContestConfig/store";
import useDisplayPrice from "@hooks/useCurrency/useDisplayPrice";
import usePriceCurveMultiple from "@hooks/usePriceCurveMultiple";
import { compareVersions } from "compare-versions";
import { VOTING_PRICE_CURVES_VERSION } from "constants/versions";
import { calculateEndPrice } from "lib/priceCurve";
import { formatEther } from "viem";
import { useShallow } from "zustand/shallow";

const ContestParametersVotingPrice = () => {
  const { contestConfig } = useContestConfigStore(useShallow(state => state));
  const { charge } = useContestStore(
    useShallow(state => ({
      charge: state.charge,
    })),
  );
  const isVotingPriceCurveEnabled = compareVersions(contestConfig.version, VOTING_PRICE_CURVES_VERSION) >= 0;

  const {
    priceCurveMultiple,
    isLoading: isPriceCurveMultipleLoading,
    isError: isPriceCurveMultipleError,
    refetch: refetchPriceCurveMultiple,
  } = usePriceCurveMultiple({
    address: contestConfig.address,
    abi: contestConfig.abi,
    chainId: contestConfig.chainId,
    enabled: isVotingPriceCurveEnabled,
  });

  const startPriceRaw = formatEther(BigInt(charge.costToVote));
  const endPriceRaw = formatEther(calculateEndPrice(charge.costToVote, Number(priceCurveMultiple)));

  const { displayValue: startDisplay, displaySymbol } = useDisplayPrice(
    startPriceRaw,
    contestConfig.chainNativeCurrencySymbol,
  );
  const { displayValue: endDisplay } = useDisplayPrice(endPriceRaw, contestConfig.chainNativeCurrencySymbol);

  if (isPriceCurveMultipleLoading) return <VotingQualifierSkeleton />;
  if (isPriceCurveMultipleError) return <VotingQualifierError onClick={() => refetchPriceCurveMultiple()} />;

  const pricePrefix = displaySymbol === "$" ? "$" : "";
  const priceSuffix = displaySymbol === "$" ? "" : ` ${displaySymbol}`;

  return (
    <li className="list-disc">
      {pricePrefix}
      {startDisplay}
      {priceSuffix} (at start) to {pricePrefix}
      {endDisplay}
      {priceSuffix} (at finish) per vote
    </li>
  );
};

export default ContestParametersVotingPrice;
