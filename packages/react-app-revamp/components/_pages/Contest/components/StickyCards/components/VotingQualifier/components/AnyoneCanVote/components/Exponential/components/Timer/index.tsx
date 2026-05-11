import { ArrowLongUpIcon } from "@heroicons/react/24/outline";
import { useContestStore } from "@hooks/useContest/store";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { PriceCurveType } from "@hooks/useDeployContest/types";
import { ContestStatus, useContestStatusStore } from "@hooks/useContestStatus/store";
import useCurrentPricePercentageIncrease from "@hooks/useCurrentPricePercentageIncrease";
import { FC } from "react";
import { useMediaQuery } from "react-responsive";
import { useShallow } from "zustand/shallow";

interface VotingQualifierAnyoneCanVoteExponentialTimerProps {
  votingTimeLeft: number;
  priceCurveUpdateInterval: number;
  priceCurveType?: PriceCurveType;
}

const VotingQualifierAnyoneCanVoteExponentialTimer: FC<VotingQualifierAnyoneCanVoteExponentialTimerProps> = ({
  votingTimeLeft,
  priceCurveUpdateInterval,
  priceCurveType = PriceCurveType.Exponential,
}) => {
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const contestStatus = useContestStatusStore(useShallow(state => state.contestStatus));
  const isVotingOpen = contestStatus === ContestStatus.VotingOpen;
  const secondsUntilNextUpdate = votingTimeLeft % priceCurveUpdateInterval;
  const { address, abi, chainId } = useContestConfigStore(useShallow(state => state.contestConfig));
  const { costToVote, getTotalVotingMinutes } = useContestStore(
    useShallow(state => ({
      costToVote: state.charge.costToVote,
      getTotalVotingMinutes: state.getTotalVotingMinutes,
    })),
  );
  const { currentPricePercentageData, isError } = useCurrentPricePercentageIncrease({
    address,
    abi,
    chainId,
    costToVote: BigInt(costToVote ?? 0),
    totalVotingMinutes: getTotalVotingMinutes(),
    priceCurveType,
    votingTimeLeft,
  });

  if (!isVotingOpen) {
    return <p className="text-[12px] text-neutral-9">(start - {isMobile ? "finish" : "finish of voting"})</p>;
  }

  // Hide timer in the last 60 seconds of voting
  if (votingTimeLeft <= 60) {
    return null;
  }

  if (isError || !currentPricePercentageData || currentPricePercentageData.isBelowThreshold) {
    return (
      <div className="flex items-center gap-1">
        <ArrowLongUpIcon className="w-4 h-4 text-neutral-9" />
        <p className="text-[12px] text-neutral-9">
          in {secondsUntilNextUpdate} {isMobile ? "sec" : "seconds"}
        </p>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="flex items-center">
        <ArrowLongUpIcon className="w-4 h-4 text-neutral-9" />
        <p className="text-[12px] text-neutral-9">
          {currentPricePercentageData.percentageIncrease}% in {secondsUntilNextUpdate} sec
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <p className="text-[12px] text-neutral-9">
        | increases {currentPricePercentageData.percentageIncrease}% in {secondsUntilNextUpdate} seconds
      </p>
    </div>
  );
};

export default VotingQualifierAnyoneCanVoteExponentialTimer;
