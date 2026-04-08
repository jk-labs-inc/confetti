import ContestNotifyButton from "@components/_pages/Contest/components/ContestNotifyButton";
import { useEntryPreview } from "@components/_pages/Submission/Desktop/components/Body/components/Content/components/Title/hooks/useEntryPreview";
import { extractTitle } from "@components/_pages/Submission/Desktop/components/Body/components/Content/components/Title/utils/extractTitle";
import useNavigateProposals from "@components/_pages/Submission/hooks/useNavigateProposals";
import { useSubmissionPageStore } from "@components/_pages/Submission/store";
import { parseVoteTimings } from "@components/_pages/Submission/types";
import { generateUrlSubmissions } from "@helpers/share";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { ShareIcon } from "@heroicons/react/24/solid";
import useContestConfigStore from "@hooks/useContestConfig/store";
import useProposalIdStore from "@hooks/useProposalId/store";
import { Link } from "interweave-autolink";
import { useShallow } from "zustand/shallow";

const SubmissionPageMobileHeader = () => {
  const contestConfig = useContestConfigStore(useShallow(state => state.contestConfig));
  const proposalId = useProposalIdStore(useShallow(state => state.proposalId));
  const { contestDetails, voteTimings, contestName, stringArray } = useSubmissionPageStore(
    useShallow(state => ({
      contestDetails: state.contestDetails,
      voteTimings: state.voteTimings,
      contestName: state.contestDetails.name,
      stringArray: state.proposalStaticData?.fieldsMetadata?.stringArray ?? [],
    })),
  );

  const { enabledPreview } = useEntryPreview();
  const entryTitle = extractTitle(stringArray, enabledPreview);
  const { closeUrl } = useNavigateProposals();

  const handleShare = () => {
    if (navigator.share) {
      const text =
        entryTitle && contestName
          ? `Vote on ${entryTitle} in ${contestName}`
          : contestName
            ? `Entry to ${contestName} contest`
            : undefined;

      navigator.share({
        url: generateUrlSubmissions(contestConfig.address, contestConfig.chainName, proposalId),
        ...(text && { text }),
      });
    }
  };

  const parsedTimings = parseVoteTimings(voteTimings);

  return (
    <>
      <Link href={closeUrl}>
        <ArrowLeftIcon width={24} className="cursor-pointer" />
      </Link>
      <div className="flex items-center gap-3 self-end">
        <button
          className="flex items-center justify-center w-12 h-8 bg-gradient-metallic rounded-[40px] cursor-pointer"
          onClick={handleShare}
        >
          <ShareIcon className="w-4 h-4 text-true-black" />
        </button>
        {parsedTimings && (
          <ContestNotifyButton
            contestName={contestDetails.name ?? ""}
            contestAddress={contestConfig.address}
            chainName={contestConfig.chainName}
            votesOpen={parsedTimings.votesOpen}
            votesClose={parsedTimings.votesClose}
            size="sm"
          />
        )}
      </div>
    </>
  );
};

export default SubmissionPageMobileHeader;
