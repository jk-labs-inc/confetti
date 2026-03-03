import useContestVoteTimer, { VotingStatus } from "@components/_pages/Submission/hooks/useContestVoteTimer";
import { useSubmissionPageStore } from "@components/_pages/Submission/store";
import TimerDisplay from "./components/TimerDisplay";
import TimerLabel from "./components/TimerLabel";
import { useShallow } from "zustand/shallow";

const SubmissionPageDesktopVotingAreaTimer = () => {
  const voteTimings = useSubmissionPageStore(useShallow(state => state.voteTimings));
  const { votingStatus, timeRemaining } = useContestVoteTimer({
    voteStart: voteTimings?.voteStart ?? null,
    contestDeadline: voteTimings?.contestDeadline ?? null,
  });

  // Don't show timer when voting is not open or closed
  if (votingStatus === VotingStatus.VotingNotOpen || votingStatus === VotingStatus.VotingClosed) {
    return null;
  }

  // Don't show timer if no time remaining data
  if (!timeRemaining) {
    return null;
  }

  return (
    <div className="inline-flex items-center w-[392px] gap-12 pl-6 pr-8 h-10 rounded-3xl border border-381d4c bg-gradient-timer">
      <TimerLabel label="voting ends" />
      <TimerDisplay timeRemaining={timeRemaining} />
    </div>
  );
};

export default SubmissionPageDesktopVotingAreaTimer;
