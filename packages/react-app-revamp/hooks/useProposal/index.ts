import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import arrayToChunks from "@helpers/arrayToChunks";
import { ContractConfig } from "@hooks/useContest";
import { useError } from "@hooks/useError";
import { readContracts } from "@wagmi/core";
import { compareVersions } from "compare-versions";
import { formatEther } from "viem";
import { MappedProposalIds, ProposalCore, useProposalStore } from "./store";
import { getProposalIdsRaw, rankProposals, transformProposalData } from "./utils";

export const PROPOSALS_PER_PAGE = 4;

export const COMMENTS_VERSION = "4.13";

export function useProposal() {
  const {
    setCurrentPagePaginationProposals,
    setIsPageProposalsLoading,
    setIsPageProposalsError,
    setHasPaginationProposalsNextPage,
    setProposalData,
    setIsListProposalsLoading,
    setIsListProposalsSuccess,
    listProposalsData,
    setListProposalsIds,
    setSubmissionsCount,
    submissionsCount,
    setTotalPagesPaginationProposals,
    setIndexPaginationProposalPerId,
    setInitialMappedProposalIds,
    initialMappedProposalIds,
  } = useProposalStore(state => state);
  const { error, handleError } = useError();

  async function fetchProposalsPage(
    contractConfig: ContractConfig,
    version: string,
    pageIndex: number,
    slice: Array<any>,
    totalPagesPaginationProposals: number,
    pageMappedProposals: MappedProposalIds[],
    resetData?: boolean,
  ) {
    setCurrentPagePaginationProposals(pageIndex);
    setIsPageProposalsLoading(true);
    setIsPageProposalsError("");

    try {
      const commentsAllowed = compareVersions(version, COMMENTS_VERSION) >= 0;

      const contracts: any[] = [];

      for (const id of slice) {
        contracts.push(
          {
            ...contractConfig,
            functionName: "getProposal",
            args: [id],
          },
          {
            ...contractConfig,
            functionName: "proposalVotes",
            args: [id],
          },
        );

        if (commentsAllowed) {
          contracts.push({
            ...contractConfig,
            functionName: "getProposalComments",
            args: [id],
          });
        }
      }

      if (commentsAllowed) {
        contracts.push({
          ...contractConfig,
          functionName: "getAllDeletedCommentIds",
          args: [],
        });
      }

      const results = await readContracts(getWagmiConfig(), { contracts });

      structureAndRankProposals(results, slice, pageMappedProposals, version, resetData);

      setIsPageProposalsLoading(false);
      setIsPageProposalsError("");
      setHasPaginationProposalsNextPage(pageIndex + 1 < totalPagesPaginationProposals);
    } catch (e) {
      handleError(e, "Something went wrong while getting proposals.");
      setIsPageProposalsError(error);
      setIsPageProposalsLoading(false);
    }
  }
  async function fetchProposalsIdsList(
    contractConfig: ContractConfig,
    version: string,
    contestDates: { votesOpen: Date },
  ) {
    setIsListProposalsLoading(true);
    setProposalData([]);

    try {
      const useLegacyGetAllProposalsIdFn =
        contractConfig.abi?.filter((el: { name: string }) => el.name === "allProposalTotalVotes")?.length > 0
          ? false
          : true;

      const proposalsIdsRawData = await getProposalIdsRaw(contractConfig, useLegacyGetAllProposalsIdFn, version);

      let proposalsIds: string[];
      let mappedProposals: MappedProposalIds[] = [];
      const currentDate = new Date();

      if (!useLegacyGetAllProposalsIdFn) {
        const hasDownvotes = compareVersions(version, "5.1") < 0;

        const extractVotes = (index: number) => {
          if (hasDownvotes) {
            const forVotesValue = BigInt(proposalsIdsRawData[1][index].forVotes);
            const againstVotesValue = BigInt(proposalsIdsRawData[1][index].againstVotes);

            return Number(formatEther(forVotesValue - againstVotesValue));
          }
          return Number(formatEther(proposalsIdsRawData[1][index]));
        };

        mappedProposals = proposalsIdsRawData[0].map((data: any, index: number) => ({
          votes: extractVotes(index),
          id: data.toString(),
        })) as MappedProposalIds[];

        setInitialMappedProposalIds(mappedProposals);

        if (currentDate >= contestDates.votesOpen) {
          proposalsIds = [...mappedProposals]
            .sort((a, b) => b.votes - a.votes)
            .map(proposal => proposal.id);
        } else {
          // Before voting opens: natural contract order (oldest → newest)
          proposalsIds = mappedProposals.map(proposal => proposal.id);
        }
      } else {
        proposalsIds = (proposalsIdsRawData as any[]).map((id: any) => id.toString());
      }

      setListProposalsIds(proposalsIds);
      setSubmissionsCount(proposalsIds.length);
      setIsListProposalsSuccess(true);
      setIsListProposalsLoading(false);

      // Pagination
      const paginationChunks = arrayToChunks(proposalsIds, PROPOSALS_PER_PAGE);
      setTotalPagesPaginationProposals(paginationChunks.length);
      setCurrentPagePaginationProposals(0);
      setIndexPaginationProposalPerId(paginationChunks);

      if (paginationChunks.length)
        fetchProposalsPage(
          contractConfig,
          version,
          0,
          paginationChunks[0],
          paginationChunks.length,
          mappedProposals,
          true,
        );
    } catch (e) {
      handleError(e, "Something went wrong while getting proposal ids.");
      setIsListProposalsSuccess(false);
      setIsListProposalsLoading(false);
    }
  }

  /**
   * Fetch a single proposal based on its ID.
   * @param proposalId - the ID of the proposal to fetch
   */
  async function fetchSingleProposal(contractConfig: ContractConfig, version: string, proposalId: any) {
    try {
      const contracts = [
        {
          ...contractConfig,
          functionName: "getProposal",
          args: [proposalId],
        },
        {
          ...contractConfig,
          functionName: "proposalVotes",
          args: [proposalId],
        },
      ];

      const results = await readContracts(getWagmiConfig(), { contracts });

      const proposalExists = initialMappedProposalIds.some(p => p.id === proposalId);

      const currentMappedProposals = proposalExists
        ? initialMappedProposalIds
        : [...initialMappedProposalIds, { votes: 0, id: proposalId }];

      setInitialMappedProposalIds(currentMappedProposals);
      structureAndRankProposals(results, [proposalId], currentMappedProposals, version);
    } catch (e) {
      handleError(e, "Something went wrong while getting the proposal.");
      setIsPageProposalsError(error);
    }
  }

  function structureAndRankProposals(
    proposalsResults: Array<any>,
    proposalIds: Array<any>,
    pageMappedProposals: MappedProposalIds[],
    version: string,
    resetData?: boolean,
  ) {
    const hasCommentsData = proposalsResults.length > proposalIds.length * 2;
    let deletedCommentIds: bigint[] = [];

    if (hasCommentsData) {
      deletedCommentIds = proposalsResults[proposalsResults.length - 1].result;
    }

    const transformedProposals = proposalIds.map((id, index) => {
      const baseIndex = hasCommentsData ? index * 3 : index * 2;

      const proposalData = proposalsResults[baseIndex].result;
      const proposalVotes = proposalsResults[baseIndex + 1];
      let proposalComments: bigint[] = [];

      if (hasCommentsData) {
        proposalComments = proposalsResults[baseIndex + 2].result;
      }

      return transformProposalData(id, proposalVotes, proposalData, proposalComments, deletedCommentIds, version);
    });

    const combinedProposals = resetData ? transformedProposals : listProposalsData.concat(transformedProposals);

    setProposalData(rankProposals(combinedProposals, pageMappedProposals));
  }

  function updateProposal(updatedProposal: ProposalCore, existingProposalsData: ProposalCore[]) {
    const updatedProposals = existingProposalsData.map(proposal =>
      proposal.id === updatedProposal.id ? updatedProposal : proposal,
    );

    const updatedIds = initialMappedProposalIds.map(idMap =>
      idMap.id === updatedProposal.id ? { ...idMap, votes: updatedProposal.netVotes } : idMap,
    );

    setProposalData(rankProposals(updatedProposals, updatedIds));
    setInitialMappedProposalIds(updatedIds);
  }

  function removeProposal(idsToDelete: string[]) {
    const deleteSet = new Set(idsToDelete);
    const remainingProposals = listProposalsData.filter(p => !deleteSet.has(p.id));
    const remainingIds = initialMappedProposalIds.filter(p => !deleteSet.has(p.id));

    setProposalData(rankProposals(remainingProposals, remainingIds));
    setInitialMappedProposalIds(remainingIds);
    setSubmissionsCount(submissionsCount - idsToDelete.length);
  }

  return {
    fetchProposalsPage,
    fetchSingleProposal,
    fetchProposalsIdsList,
    updateProposal,
    removeProposal,
  };
}

export default useProposal;
