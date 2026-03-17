import { ContestStateEnum, useContestStateStore } from "@hooks/useContestState/store";
import { ContestStatus, useContestStatusStore } from "@hooks/useContestStatus/store";
import { useContestStore } from "@hooks/useContest/store";
import { useCountdownTimer } from "@hooks/useTimer";
import { useShallow } from "zustand/shallow";
import ContestCountdown from "./components/Countdown";
import VotingContestQualifier from "./components/VotingQualifier";
import PriceCurveWrapper from "../PriceCurveChart/wrapper";
import usePriceCurveChartStore from "../PriceCurveChart/store";

const ContestStickyCards = () => {
  const contestStatus = useContestStatusStore(useShallow(state => state.contestStatus));
  const { contestState } = useContestStateStore(state => state);
  const { votesClose } = useContestStore(state => state);
  const { isExpanded } = usePriceCurveChartStore();
  const isContestCanceled = contestState === ContestStateEnum.Canceled;
  const votingTimeLeft = useCountdownTimer(votesClose);

  return (
    <div className="flex flex-col">
      <div className="hidden md:flex flex-col bg-true-black sticky -top-px z-10 mt-8">
        <div className="flex gap-4 py-4">
          <ContestCountdown votingTimeLeft={votingTimeLeft} />
          <VotingContestQualifier votingTimeLeft={votingTimeLeft} />
        </div>
      </div>
      {isExpanded && <PriceCurveWrapper />}
    </div>
  );
};

export default ContestStickyCards;
