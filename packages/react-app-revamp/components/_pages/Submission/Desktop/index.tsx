import SubmissionPageDesktopBody from "./components/Body";
import SubmissionPageDesktopContestTitle from "./components/ContestTitle";
import SubmissionPageDesktopVotingArea from "./components/VotingArea";
import SubmissionPageDesktopVotingAreaTimer from "./components/VotingArea/components/Timer";

const SubmissionPageDesktopLayout = () => {
  return (
    <div className="px-20 mt-12 animate-fade-in flex flex-col h-[calc(100dvh-3rem)] pb-4">
      <div className="grid grid-cols-[50%_50%] xl:grid-cols-[60%_40%] gap-x-4 items-center shrink-0">
        <SubmissionPageDesktopContestTitle />
        <SubmissionPageDesktopVotingAreaTimer />
      </div>
      <div className="grid grid-cols-[50%_50%] xl:grid-cols-[60%_40%] gap-x-4 mt-4 flex-1 min-h-0">
        <div className="min-w-0 min-h-0">
          <SubmissionPageDesktopBody />
        </div>
        <div className="min-w-0 min-h-0 relative">
          <div className="absolute inset-0">
            <SubmissionPageDesktopVotingArea />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionPageDesktopLayout;
