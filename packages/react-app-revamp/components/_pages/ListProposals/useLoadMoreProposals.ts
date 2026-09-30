import useContestConfigStore from "@hooks/useContestConfig/store";
import useProposal from "@hooks/useProposal";
import { useProposalStore } from "@hooks/useProposal/store";
import { useCallback } from "react";
import { useShallow } from "zustand/shallow";

export interface LoadMoreProposals {
  hasNextPage: boolean;
  loadMore: () => void;
}

export const useLoadMoreProposals = (): LoadMoreProposals => {
  const contestConfig = useContestConfigStore(useShallow(state => state.contestConfig));
  const { fetchProposalsPage } = useProposal();
  const {
    initialMappedProposalIds,
    currentPagePaginationProposals,
    indexPaginationProposals,
    submissionsCount,
    totalPagesPaginationProposals,
    loadedCount,
  } = useProposalStore(
    useShallow(state => ({
      initialMappedProposalIds: state.initialMappedProposalIds,
      currentPagePaginationProposals: state.currentPagePaginationProposals,
      indexPaginationProposals: state.indexPaginationProposals,
      submissionsCount: state.submissionsCount,
      totalPagesPaginationProposals: state.totalPagesPaginationProposals,
      loadedCount: state.listProposalsData.length,
    })),
  );

  const loadMore = useCallback(() => {
    fetchProposalsPage(
      {
        chainId: contestConfig.chainId,
        address: contestConfig.address as `0x${string}`,
        abi: contestConfig.abi,
      },
      contestConfig.version,
      currentPagePaginationProposals + 1,
      indexPaginationProposals[currentPagePaginationProposals + 1],
      totalPagesPaginationProposals,
      initialMappedProposalIds,
    );
  }, [
    fetchProposalsPage,
    contestConfig,
    currentPagePaginationProposals,
    indexPaginationProposals,
    totalPagesPaginationProposals,
    initialMappedProposalIds,
  ]);

  return { hasNextPage: loadedCount < submissionsCount, loadMore };
};

export default useLoadMoreProposals;
