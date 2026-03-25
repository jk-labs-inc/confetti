import { ContestStateEnum, useContestStateStore } from "@hooks/useContestState/store";
import { useContestStore } from "@hooks/useContest/store";
import { useCountdownTimer } from "@hooks/useTimer";
import ContestCountdown from "./components/Countdown";
import VotingContestQualifier from "./components/VotingQualifier";

const ContestStickyCards = () => {
  const { contestState } = useContestStateStore(state => state);
  const { votesClose } = useContestStore(state => state);
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
    </div>
  );
};

export default ContestStickyCards;
