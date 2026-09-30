import { getEntryPreview } from "@components/Voting/utils/getEntryPreview";
import { useEnabledEntryPreview } from "@hooks/useEnabledEntryPreview";
import { useProposalStore } from "@hooks/useProposal/store";
import { useMemo } from "react";

export interface EntryVotersSheetEntry {
  title: string;
  image?: string;
  rank: number;
  votes: number;
}

const UNTITLED_ENTRY = "untitled entry";

export const useSheetEntry = (proposalId: string | null): EntryVotersSheetEntry => {
  const enabledPreview = useEnabledEntryPreview();
  const proposal = useProposalStore(state => state.listProposalsData.find(entry => entry.id === proposalId));

  return useMemo(() => {
    const { image, title } = getEntryPreview(proposal, enabledPreview);
    return {
      title: title?.trim() || UNTITLED_ENTRY,
      image: image?.trim() || undefined,
      rank: proposal?.rank ?? 0,
      votes: proposal?.netVotes ?? 0,
    };
  }, [proposal, enabledPreview]);
};
