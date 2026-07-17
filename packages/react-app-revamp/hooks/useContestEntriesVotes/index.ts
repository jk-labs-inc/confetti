import { ContestCardConfig } from "@hooks/useContestCardConfig";
import { getProposalIdsRaw } from "@hooks/useProposal/utils";
import { useQuery } from "@tanstack/react-query";
import { formatEther } from "viem";

export interface ContestEntryVotes {
  id: string;
  votes: number | null;
}

interface ContestEntriesVotesData {
  entries: ContestEntryVotes[];
  totalVotes: number;
  hasVoteData: boolean;
}

interface UseContestEntriesVotesParams {
  config: ContestCardConfig | undefined;
  enabled?: boolean;
}

async function fetchContestEntriesVotes(config: ContestCardConfig): Promise<ContestEntriesVotesData> {
  const contractConfig = { address: config.address, abi: config.abi, chainId: config.chainId };
  const raw = await getProposalIdsRaw(contractConfig, config.isLegacy, config.version);

  if (config.isLegacy) {
    const entries = (raw as any[]).map(id => ({ id: id.toString(), votes: null }));
    return { entries, totalVotes: 0, hasVoteData: false };
  }

  const extractVotes = (index: number) => {
    if (config.hasDownvotes) {
      const forVotes = BigInt(raw[1][index].forVotes);
      const againstVotes = BigInt(raw[1][index].againstVotes);
      return Number(formatEther(forVotes - againstVotes));
    }
    return Number(formatEther(raw[1][index]));
  };

  const entries = (raw[0] as any[]).map((id, index) => ({ id: id.toString(), votes: extractVotes(index) }));
  const totalVotes = entries.reduce((sum, entry) => sum + Math.max(0, entry.votes ?? 0), 0);

  return { entries, totalVotes, hasVoteData: true };
}

export function useContestEntriesVotes({ config, enabled = true }: UseContestEntriesVotesParams) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["contestEntriesVotes", config?.address.toLowerCase(), config?.chainId],
    queryFn: () => fetchContestEntriesVotes(config as ContestCardConfig),
    enabled: enabled && !!config,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  return {
    entries: data?.entries ?? [],
    totalVotes: data?.totalVotes ?? 0,
    hasVoteData: data?.hasVoteData ?? false,
    isLoading,
    isError,
  };
}

export default useContestEntriesVotes;
