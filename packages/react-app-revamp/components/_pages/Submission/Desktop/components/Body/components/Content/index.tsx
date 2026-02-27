import { useSubmissionPageStore } from "@components/_pages/Submission/store";
import SubmissionDelete from "@components/_pages/Submission/shared/components/SubmissionDelete";
import UserProfileDisplay from "@components/UI/UserProfileDisplay";
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
  const { isEntryPreviewTitle, enabledPreview } = useEntryPreview();

  if (!proposalStaticData) {
    return null;
  }

  const hasTitle = isEntryPreviewTitle && !!extractTitle(proposalStaticData.fieldsMetadata.stringArray, enabledPreview);

  return (
    <div className="bg-primary-13 rounded-4xl flex flex-col h-full">
      <div className="bg-gradient-entry-title rounded-t-4xl">
        {hasTitle && (
          <SubmissionPageDesktopBodyContentTitle
            stringArray={proposalStaticData.fieldsMetadata.stringArray}
            authorAddress={proposalStaticData.author}
          />
        )}

        <div className="flex items-center gap-3 px-8 pt-4 pb-6">
          <SubmissionPageDesktopVotes />
          <SubmissionPageDesktopHeaderShare />
          <SubmissionPageDesktopEntryNavigation />
          <div className="ml-auto">
            <SubmissionDelete />
          </div>
        </div>

        {!hasTitle && (
          <div className="flex items-center gap-1.5 px-8 pb-6">
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
