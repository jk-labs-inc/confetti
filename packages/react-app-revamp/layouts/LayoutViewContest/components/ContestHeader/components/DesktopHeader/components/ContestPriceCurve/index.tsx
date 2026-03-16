import usePriceCurveChartStore from "@components/_pages/Contest/components/PriceCurveChart/store";
import { ArrowLongUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { useContestStore } from "@hooks/useContest/store";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { ContestStatus, useContestStatusStore } from "@hooks/useContestStatus/store";
import useDisplayPrice from "@hooks/useCurrency/useDisplayPrice";
import useCurrentPricePerVote from "@hooks/useCurrentPricePerVote";
import useCurrentPricePercentageIncrease from "@hooks/useCurrentPricePercentageIncrease";
import usePriceCurveMultiple from "@hooks/usePriceCurveMultiple";
import usePriceCurveUpdateInterval from "@hooks/usePriceCurveUpdateInterval";
import { useCountdownTimer } from "@hooks/useTimer";
import { calculateEndPrice } from "lib/priceCurve";
import { motion } from "motion/react";
import { formatEther } from "viem";
import { useShallow } from "zustand/shallow";

const ContestPriceCurve = () => {
  const contestStatus = useContestStatusStore(useShallow(state => state.contestStatus));
  const isVotingOpen = contestStatus === ContestStatus.VotingOpen;
  const { isExpanded, setIsExpanded } = usePriceCurveChartStore();

  if (isVotingOpen) {
    return (
      <div className="flex items-center gap-1 whitespace-nowrap">
        <span className="text-2xl">📈</span>
        <LivePriceDisplay />
        <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center justify-center w-6 h-6 ml-2">
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2, ease: "easeInOut" }}>
            <ChevronDownIcon className="w-5 h-5 text-neutral-9" />
          </motion.div>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 whitespace-nowrap">
      <span className="text-2xl">📈</span>
      <PriceRangeDisplay />
      <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center justify-center w-6 h-6 ml-2">
        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2, ease: "easeInOut" }}>
          <ChevronDownIcon className="w-5 h-5 text-neutral-9 mt-1" />
        </motion.div>
      </button>
    </div>
  );
};

const LivePriceDisplay = () => {
  const { contestConfig } = useContestConfigStore(useShallow(state => state));
  const { votesClose, charge, getTotalVotingMinutes } = useContestStore(
    useShallow(state => ({
      votesClose: state.votesClose,
      charge: state.charge,
      getTotalVotingMinutes: state.getTotalVotingMinutes,
    })),
  );
  const votingTimeLeft = useCountdownTimer(votesClose);

  const { currentPricePerVote } = useCurrentPricePerVote({
    address: contestConfig.address,
    abi: contestConfig.abi,
    chainId: contestConfig.chainId,
    votingClose: votesClose,
  });

  const { displayValue, displaySymbol } = useDisplayPrice(currentPricePerVote, contestConfig.chainNativeCurrencySymbol);

  const { priceCurveUpdateInterval } = usePriceCurveUpdateInterval({
    address: contestConfig.address,
    abi: contestConfig.abi,
    chainId: contestConfig.chainId,
  });

  const { currentPricePercentageData } = useCurrentPricePercentageIncrease({
    address: contestConfig.address,
    abi: contestConfig.abi,
    chainId: contestConfig.chainId,
    costToVote: BigInt(charge.costToVote ?? 0),
    totalVotingMinutes: getTotalVotingMinutes(),
  });

  const secondsUntilNextUpdate = priceCurveUpdateInterval > 0 ? votingTimeLeft % priceCurveUpdateInterval : 0;
  const isUsd = displaySymbol === "$";
  const priceText = isUsd ? `$${displayValue}` : `${displayValue} ${displaySymbol}`;
  const showTimer = votingTimeLeft > 60;

  return (
    <div className="flex items-center gap-0.5">
      <p className="text-[16px] text-neutral-9 font-bold">{priceText}/vote</p>
      {showTimer && (
        <div className="flex items-center gap-0.5">
          <ArrowLongUpIcon className="w-4 h-4 text-neutral-9" />
          <p className="text-base text-neutral-9">in {secondsUntilNextUpdate} seconds</p>
        </div>
      )}
    </div>
  );
};

const PriceRangeDisplay = () => {
  const { contestConfig } = useContestConfigStore(useShallow(state => state));
  const { costToVote } = useContestStore(useShallow(state => ({ costToVote: state.charge.costToVote })));

  const { priceCurveMultiple } = usePriceCurveMultiple({
    address: contestConfig.address,
    abi: contestConfig.abi,
    chainId: contestConfig.chainId,
  });

  const startPriceRaw = formatEther(BigInt(costToVote ?? 0));
  const endPriceRaw = formatEther(calculateEndPrice(costToVote ?? 0, Number(priceCurveMultiple)));

  const { displayValue: startDisplay, displaySymbol } = useDisplayPrice(
    startPriceRaw,
    contestConfig.chainNativeCurrencySymbol,
  );
  const { displayValue: endDisplay } = useDisplayPrice(endPriceRaw, contestConfig.chainNativeCurrencySymbol);

  const isUsd = displaySymbol === "$";

  return (
    <p className="text-base text-neutral-9 font-bold">
      {isUsd ? `$${startDisplay} → $${endDisplay}` : `${startDisplay} → ${endDisplay} ${displaySymbol}`}
      /vote
    </p>
  );
};

export default ContestPriceCurve;
