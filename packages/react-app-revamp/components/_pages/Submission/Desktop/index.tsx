import SubmissionPageDesktopBody from "./components/Body";
import SubmissionPageDesktopContestTitle from "./components/ContestTitle";
import SubmissionPageDesktopVotingArea from "./components/VotingArea";
import SubmissionPageDesktopVotingAreaTimer from "./components/VotingArea/components/Timer";

const SubmissionPageDesktopLayout = () => {
  return (
    <div className="px-20 mt-12 animate-fade-in">
      <div className="grid grid-cols-[1fr_1fr] xl:grid-cols-[3fr_2fr] gap-x-4 items-center">
        <SubmissionPageDesktopContestTitle />
        <SubmissionPageDesktopVotingAreaTimer />
      </div>
      <div className="grid grid-cols-[1fr_1fr] xl:grid-cols-[3fr_2fr] gap-x-4 mt-4">
        <div className="min-w-0 relative">
          <div className="absolute inset-0">
            <SubmissionPageDesktopBody />
          </div>
        </div>
        <div className="min-w-0 overflow-hidden">
          <SubmissionPageDesktopVotingArea />
        </div>
      </div>
    </div>
  );
};

export default SubmissionPageDesktopLayout;
