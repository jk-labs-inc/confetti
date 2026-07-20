import { getEntryPreview } from "@components/_pages/Contest/VotingSidebar/getEntryPreview";
import { verifyEntryPreviewPrompt } from "@components/_pages/DialogModalSendProposal/utils";
import { useMetadataStore } from "@hooks/useMetadataFields/store";
import { useCallback } from "react";

interface EntryLike {
  description?: string;
  metadataFields?: { stringArray?: string[] };
  fieldsMetadata?: { stringArray?: string[] };
}

export function useEntryTitleResolver(): (entry: EntryLike | undefined) => string | undefined {
  const firstFieldPrompt = useMetadataStore(state => (state.fields.length > 0 ? state.fields[0].prompt : null));

  const enabledPreview = firstFieldPrompt ? verifyEntryPreviewPrompt(firstFieldPrompt).enabledPreview : null;

  return useCallback(
    (entry: EntryLike | undefined) => getEntryPreview(entry, enabledPreview).title?.trim() || undefined,
    [enabledPreview],
  );
}

export default useEntryTitleResolver;
