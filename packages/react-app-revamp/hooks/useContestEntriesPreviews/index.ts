import { EntryPreviewInfo, getEntryPreview } from "@components/_pages/Contest/VotingSidebar/getEntryPreview";
import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import { ContestCardConfig } from "@hooks/useContestCardConfig";
import { useQueries, type UseQueryResult } from "@tanstack/react-query";
import { readContracts } from "@wagmi/core";
import { useCallback, useMemo } from "react";

interface FetchedEntry {
  description?: string;
  fieldsMetadata?: { stringArray?: string[] };
}

interface UseContestEntriesPreviewsParams {
  config: ContestCardConfig | undefined;
  proposalIds: string[];
  enabled?: boolean;
}

export function useContestEntriesPreviews({ config, proposalIds, enabled = true }: UseContestEntriesPreviewsParams) {
  const distinctIds = useMemo(() => Array.from(new Set(proposalIds)).sort(), [proposalIds]);

  const combine = useCallback(
    (results: UseQueryResult<FetchedEntry>[]) => {
      const byId = new Map<string, FetchedEntry>();

      const pendingIds = new Set<string>();
      results.forEach((result, i) => {
        if (result.data) byId.set(distinctIds[i], result.data);
        if (result.isPending) pendingIds.add(distinctIds[i]);
      });
      return { byId, pendingIds, isLoading: results.some(result => result.isLoading) };
    },
    [distinctIds],
  );

  const { byId, pendingIds, isLoading } = useQueries({
    queries: distinctIds.map(id => ({
      queryKey: ["contestEntryTitle", config?.address.toLowerCase(), config?.chainId, id],

      queryFn: async (): Promise<FetchedEntry> => {
        if (!config) throw new Error(`missing card config for entry ${id}`);
        const [proposal] = await readContracts(getWagmiConfig(), {
          allowFailure: false,
          contracts: [
            {
              address: config.address,
              abi: config.abi,
              chainId: config.chainId,
              functionName: "getProposal",
              args: [id],
            },
          ],
        });
        if (!proposal) throw new Error(`getProposal(${id}) returned no data for ${config.address}`);
        const data = proposal as FetchedEntry;
        return {
          description: data.description,
          fieldsMetadata: data.fieldsMetadata ?? (data.description ? { stringArray: [data.description] } : undefined),
        };
      },
      enabled: enabled && !!config,
      staleTime: Infinity,
    })),
    combine,
  });

  const previewsById = useMemo(() => {
    const map = new Map<string, EntryPreviewInfo>();
    if (!config) return map;
    for (const id of distinctIds) {
      const entry = byId.get(id);
      if (!entry) continue;
      map.set(id, getEntryPreview(entry, config.enabledPreview));
    }
    return map;
  }, [distinctIds, byId, config]);

  return { previewsById, pendingIds, isLoading };
}

export default useContestEntriesPreviews;
