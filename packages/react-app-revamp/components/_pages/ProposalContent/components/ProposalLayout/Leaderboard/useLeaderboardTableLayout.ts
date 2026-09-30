import { useProposalStore } from "@hooks/useProposal/store";
import { useIsInEntriesColumn } from "@layouts/LayoutViewContest/components/ContestEntriesColumn/context";

export const RANKED_VOTING_GRID_CLASS_NAME = "grid-cols-[40px_1fr_120px_80px_80px] lg:grid-cols-[40px_1fr_120px_80px]";
export const CONTAINED_ROW_INSET_CLASS_NAME = "px-3";

export const useLeaderboardTableLayout = (isVotingActive: boolean) => {
  const isContained = useIsInEntriesColumn();
  const hasRankedEntries = useProposalStore(state => state.listProposalsData.some(proposal => proposal.rank > 0));

  return { isContained, showInlineRank: isContained && isVotingActive && hasRankedEntries };
};
