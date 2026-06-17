import { getEntryPreview } from "@components/_pages/Contest/VotingSidebar/getEntryPreview";
import { verifyEntryPreviewPrompt } from "@components/_pages/DialogModalSendProposal/utils";
import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import { ContestConfig } from "@hooks/useContestConfig/store";
import { useMetadataStore } from "@hooks/useMetadataFields/store";
import { useProposalStore, useProposalStoreApi } from "@hooks/useProposal/store";
import { useQueries, type UseQueryResult } from "@tanstack/react-query";
import { readContracts } from "@wagmi/core";
import { useCallback, useMemo } from "react";

// Minimal slice of a proposal that getEntryPreview needs to derive a display title. getProposal
// returns the entry's content as `description` and (on newer contracts) `fieldsMetadata`.
interface FetchedEntry {
  description?: string;
  fieldsMetadata?: { stringArray?: string[] };
}

interface UseContestEntryTitlesParams {
  contestConfig: ContestConfig;
  proposalIds: string[];
  enabled?: boolean;
}

/**
 * Resolves a display title — the "option" a voter backed (e.g. "NANAMI") — for each voted-on proposal,
 * for the price-curve voter tooltip.
 *
 * Titles are derived with the same getEntryPreview the rest of the contest UI uses, so they match what
 * voters actually saw (for a TITLE-type contest that's `fieldsMetadata.stringArray[0]`; otherwise the
 * entry content).
 *
 * One cached query PER proposal id (keyed by id, staleTime Infinity):
 *  - each id is resolved exactly once, so a new vote on a new entry fetches only that id and never
 *    refetches the ones already resolved;
 *  - the cache is independent of the proposal store, so a title can't vanish if the store later evicts
 *    the entry (e.g. the paged list reloads). The store is still used as a free, reactive source when
 *    it already holds the entry — the chain read only fires for ids the store doesn't have yet.
 */
export function useContestEntryTitles({
  contestConfig,
  proposalIds,
  enabled = true,
}: UseContestEntryTitlesParams): Map<string, string> {
  const listProposalsData = useProposalStore(state => state.listProposalsData);
  const proposalStore = useProposalStoreApi();
  const firstFieldPrompt = useMetadataStore(state => (state.fields.length > 0 ? state.fields[0].prompt : null));

  const enabledPreview = firstFieldPrompt ? verifyEntryPreviewPrompt(firstFieldPrompt).enabledPreview : null;

  const { address, abi, chainId } = contestConfig;

  const distinctIds = useMemo(() => Array.from(new Set(proposalIds)).sort(), [proposalIds]);

  // Merge the per-id query results into one id -> entry map. Wrapped in useCallback so react-query only
  // re-runs it (and returns a new map) when a query result actually changes, not on every render.
  const combine = useCallback(
    (results: UseQueryResult<FetchedEntry | null>[]) => {
      const map = new Map<string, FetchedEntry>();
      results.forEach((result, i) => {
        if (result.data) map.set(distinctIds[i], result.data);
      });
      return map;
    },
    [distinctIds],
  );

  const fetchedById = useQueries({
    queries: distinctIds.map(id => ({
      queryKey: ["contestEntryTitle", address?.toLowerCase(), chainId, id],
      queryFn: async (): Promise<FetchedEntry | null> => {
        // Reuse the store's copy when it's already loaded (no extra chain read); otherwise read it once.
        const fromStore = proposalStore.getState().listProposalsData.find(p => p.id === id);
        if (fromStore) return { description: fromStore.description, fieldsMetadata: fromStore.fieldsMetadata };

        const [result] = await readContracts(getWagmiConfig(), {
          contracts: [{ address, abi, chainId, functionName: "getProposal", args: [id] }],
        });
        if (result.status !== "success" || !result.result) return null;
        const data = result.result as FetchedEntry;
        return { description: data.description, fieldsMetadata: data.fieldsMetadata };
      },
      enabled: enabled && !!address && !!abi,
      staleTime: Infinity,
    })),
    combine,
  });

  return useMemo(() => {
    const storeById = new Map(listProposalsData.map(p => [p.id, p]));
    const titles = new Map<string, string>();

    for (const id of distinctIds) {
      // Prefer the live store entry (freshest), fall back to the cached fetch (eviction-safe).
      const entry = storeById.get(id) ?? fetchedById.get(id);
      if (!entry) continue;
      const title = getEntryPreview(entry, enabledPreview).title?.trim();
      if (title) titles.set(id, title);
    }

    return titles;
  }, [distinctIds, listProposalsData, fetchedById, enabledPreview]);
}

export default useContestEntryTitles;
