import { verifyEntryPreviewPrompt } from "@components/_pages/DialogModalSendProposal/utils";
import { EntryPreview } from "@hooks/useDeployContest/slices/contestMetadataSlice";
import { useMetadataStore } from "@hooks/useMetadataFields/store";
import { useMemo } from "react";

export const useEnabledEntryPreview = (): EntryPreview | null => {
  const firstFieldPrompt = useMetadataStore(state => (state.fields.length > 0 ? state.fields[0].prompt : null));

  return useMemo(
    () => (firstFieldPrompt ? verifyEntryPreviewPrompt(firstFieldPrompt).enabledPreview : null),
    [firstFieldPrompt],
  );
};

export const isTweetEntryPreview = (enabledPreview: EntryPreview | null): boolean =>
  enabledPreview === EntryPreview.TWEET || enabledPreview === EntryPreview.TWEET_AND_TITLE;

export default useEnabledEntryPreview;
