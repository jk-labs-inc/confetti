import { useSubmissionPageStore } from "@components/_pages/Submission/store";
import SubmissionDelete from "@components/_pages/Submission/shared/components/SubmissionDelete";
import UserProfileDisplay from "@components/UI/UserProfileDisplay";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { useFetchUserVotesOnProposal } from "@hooks/useFetchUserVotesOnProposal";
import useProposalIdStore from "@hooks/useProposalId/store";
import Image from "next/image";
import { useShallow } from "zustand/shallow";
import SubmissionPageDesktopEntryNavigation from "../../../Header/components/EntryNavigation";
import SubmissionPageDesktopHeaderShare from "../../../Header/components/Share";
import SubmissionPageDesktopVotes from "../../../Header/components/Votes";
import SubmissionPageDesktopBodyContentDescription from "./components/Description";
import SubmissionPageDesktopBodyContentTitle from "./components/Title";
import { useEntryPreview } from "./components/Title/hooks/useEntryPreview";
import { extractTitle } from "./components/Title/utils/extractTitle";

const SubmissionPageDesktopBodyContent = () => {
  const proposalStaticData = useSubmissionPageStore(useShallow(state => state.proposalStaticData));
  const contestAddress = useContestConfigStore(useShallow(state => state.contestConfig.address));
  const proposalId = useProposalIdStore(useShallow(state => state.proposalId));
  const { currentUserVotesOnProposal } = useFetchUserVotesOnProposal(contestAddress, proposalId);
  const hasVoted = (currentUserVotesOnProposal.data ?? 0) > 0;
  const { isEntryPreviewTitle, enabledPreview } = useEntryPreview();

  if (!proposalStaticData) {
    return null;
  }

  const hasTitle = isEntryPreviewTitle && !!extractTitle(proposalStaticData.fieldsMetadata.stringArray, enabledPreview);

  return (
    <div className="bg-primary-13 rounded-4xl flex flex-col h-full">
      <div className="relative bg-gradient-entry-title rounded-t-4xl">
        {hasTitle && (
          <SubmissionPageDesktopBodyContentTitle
            stringArray={proposalStaticData.fieldsMetadata.stringArray}
            authorAddress={proposalStaticData.author}
          />
        )}

        <div className="flex items-center gap-3 px-8 pt-4 pb-4">
          <SubmissionPageDesktopVotes />
          <SubmissionPageDesktopHeaderShare />
          <SubmissionPageDesktopEntryNavigation />
          <div className="ml-auto">
            <SubmissionDelete />
          </div>
        </div>

        {hasVoted && (
          <Image
            src="/entry/i-voted.webp"
            alt="I voted"
            width={64}
            height={64}
            className="absolute top-1/2 -translate-y-1/2 right-6"
          />
        )}

        {!hasTitle && (
          <div className="flex items-center gap-1.5 px-8 pb-4">
            <span className="text-neutral-9 text-[16px] font-bold">by</span>
            <UserProfileDisplay
              ethereumAddress={proposalStaticData.author}
              shortenOnFallback
              size="compact"
              textColor="text-positive-11"
            />
          </div>
        )}

        <div className="mx-8">
          <hr className="border-neutral-17" />
        </div>
      </div>

      <SubmissionPageDesktopBodyContentDescription description={proposalStaticData.description} />
    </div>
  );
};

export default SubmissionPageDesktopBodyContent;
