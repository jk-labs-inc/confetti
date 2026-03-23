import usePriceCurveChartStore from "@components/PriceCurve/store";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { ContestStatus, useContestStatusStore } from "@hooks/useContestStatus/store";
import usePriceCurveUpdateInterval from "@hooks/usePriceCurveUpdateInterval";
import { motion } from "motion/react";
import { FC } from "react";
import { useShallow } from "zustand/shallow";
import VotingQualifierError from "../../../../shared/Error";
import VotingQualifierSkeleton from "../../../../shared/Skeleton";
import VotingQualifierAnyoneCanVoteExponentialTimer from "./components/Timer";
import VotingQualifierAnyoneCanVoteExponentialVotePrice from "./components/VotePrice";

interface VotingQualifierAnyoneCanVoteExponentialProps {
  votingTimeLeft: number;
}

const VotingQualifierAnyoneCanVoteExponential: FC<VotingQualifierAnyoneCanVoteExponentialProps> = ({
  votingTimeLeft,
}) => {
  const contestStatus = useContestStatusStore(useShallow(state => state.contestStatus));
  const { contestConfig } = useContestConfigStore(useShallow(state => state));
  const { priceCurveUpdateInterval, isLoading, isError, refetch } = usePriceCurveUpdateInterval({
    address: contestConfig.address,
    abi: contestConfig.abi,
    chainId: contestConfig.chainId,
  });
  const { isExpanded, setIsExpanded } = usePriceCurveChartStore();
  const isPriceCurveChartToggleDisabled = false;

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  if (isLoading) {
    return <VotingQualifierSkeleton />;
  }

  if (isError) {
    return <VotingQualifierError onClick={() => refetch()} />;
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-2 md:gap-4">
        <div className="flex items-center gap-1 md:gap-2">
          <img src="/contest/price-interval.svg" alt="timer" />
          <p className="text-[12px] md:text-[16px] font-bold text-neutral-9">
            price per vote
          </p>
          <VotingQualifierAnyoneCanVoteExponentialTimer
            votingTimeLeft={votingTimeLeft}
            priceCurveUpdateInterval={priceCurveUpdateInterval}
          />
        </div>
        <VotingQualifierAnyoneCanVoteExponentialVotePrice />
      </div>
      {!isPriceCurveChartToggleDisabled && (
        <button
          onClick={handleToggle}
          className="flex items-center justify-center w-6 h-6"
          tabIndex={0}
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            style={{ willChange: "transform" }}
          >
            {isExpanded ? (
              <ChevronUpIcon className="w-6 h-6 text-positive-11" />
            ) : (
              <ChevronDownIcon className="w-6 h-6 text-positive-11" />
            )}
          </motion.div>
        </button>
      )}
    </div>
  );
};

export default VotingQualifierAnyoneCanVoteExponential;
