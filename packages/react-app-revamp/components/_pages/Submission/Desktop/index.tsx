import SubmissionPageDesktopBody from "./components/Body";
import SubmissionPageDesktopContestTitle from "./components/ContestTitle";
import SubmissionPageDesktopVotingArea from "./components/VotingArea";
import SubmissionPageDesktopVotingAreaTimer from "./components/VotingArea/components/Timer";

const SubmissionPageDesktopLayout = () => {
  return (
    <div className="px-20 mt-12 animate-fade-in">
      <div className="grid grid-cols-[50%_50%] xl:grid-cols-[60%_40%] gap-x-4 items-center">
        <SubmissionPageDesktopContestTitle />
        <SubmissionPageDesktopVotingAreaTimer />
      </div>
      <div className="grid grid-cols-[50%_50%] xl:grid-cols-[60%_40%] gap-x-4 gap-y-4 mt-4">
        <div className="min-w-0 self-stretch">
          <SubmissionPageDesktopBody />
        </div>
        <div className="min-w-0 flex-1">
          <SubmissionPageDesktopVotingArea />
        </div>
      </div>
    </div>
  );
};

export default SubmissionPageDesktopLayout;
