import { EntryPreviewHeaderProps } from "@components/Voting/components/EntryPreviewHeader";
import { getEntryPreview } from "@components/Voting/utils/getEntryPreview";
import { verifyEntryPreviewPrompt } from "@components/_pages/DialogModalSendProposal/utils";
import { useCastVotesStore } from "@hooks/useCastVotes/store";
import { useContestStore } from "@hooks/useContest/store";
import { useMetadataStore } from "@hooks/useMetadataFields/store";
import { useProposalStore } from "@hooks/useProposal/store";
import { useMemo } from "react";
import { useShallow } from "zustand/shallow";

export const usePickedEntryPreview = (): EntryPreviewHeaderProps => {
  const pickedProposal = useCastVotesStore(state => state.pickedProposal);
  const listProposalsData = useProposalStore(useShallow(state => state.listProposalsData));
  const metadataFieldsConfig = useMetadataStore(state => state.fields);
  const contestName = useContestStore(state => state.contestName);

  const pickedProposalData = listProposalsData.find(p => p.id === pickedProposal);
  const { enabledPreview } =
    metadataFieldsConfig.length > 0
      ? verifyEntryPreviewPrompt(metadataFieldsConfig[0].prompt)
      : { enabledPreview: null };
  const { image, title } = getEntryPreview(pickedProposalData, enabledPreview);

  return useMemo(() => ({ image, title, contestName }), [image, title, contestName]);
};
