import SubmissionPageMobileBody from "./components/Body";
import SubmissionPageMobileHeader from "./components/Header";
import SubmissionPageMobileEntryNavigation from "./components/EntryNavigation";
import SubmissionPageMobileVotingFooter from "./components/VotingFooter";

const SubmissionPageMobileLayout = () => {
  const isInPwaMode = typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches;

  return (
    <div className="bg-true-black px-8 mt-8">
      <div className={`flex justify-between ${isInPwaMode ? "mt-0" : "mt-8"}`}>
        <SubmissionPageMobileHeader />
      </div>

      <div className="flex flex-col gap-6 mt-5 pb-4">
        <SubmissionPageMobileBody />
      </div>

      <SubmissionPageMobileEntryNavigation isInPwaMode={isInPwaMode} />
      <SubmissionPageMobileVotingFooter />
    </div>
  );
};

export default SubmissionPageMobileLayout;
