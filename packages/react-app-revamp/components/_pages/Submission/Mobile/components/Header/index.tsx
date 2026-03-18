import { generateUrlSubmissions } from "@helpers/share";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { ShareIcon } from "@heroicons/react/24/solid";
import useContestConfigStore from "@hooks/useContestConfig/store";
import useProposalIdStore from "@hooks/useProposalId/store";
import useNavigateProposals from "@components/_pages/Submission/hooks/useNavigateProposals";
import { Link } from "interweave-autolink";
import { useShallow } from "zustand/shallow";

const SubmissionPageMobileHeader = () => {
  const contestConfig = useContestConfigStore(useShallow(state => state.contestConfig));
  const proposalId = useProposalIdStore(useShallow(state => state.proposalId));
  const { closeUrl } = useNavigateProposals();

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        url: generateUrlSubmissions(contestConfig.address, contestConfig.chainName, proposalId),
      });
    }
  };

  return (
    <>
      <Link href={closeUrl}>
        <ArrowLeftIcon width={24} className="cursor-pointer" />
      </Link>
      <div className="flex self-end">
        <button
          className="flex items-center bg-true-black rounded-full border-neutral-11 border overflow-hidden w-8 h-8 cursor-pointer"
          onClick={handleShare}
        >
          <ShareIcon className="w-4 h-4 text-neutral-11 m-auto" />
        </button>
      </div>
    </>
  );
};

export default SubmissionPageMobileHeader;
