import useContestConfigStore from "@hooks/useContestConfig/store";
import useContestEntryTitles from "@hooks/useContestEntryTitles";
import useContestVoteLedger, { ContestVoteEvent } from "@hooks/useContestVoteLedger";
import { useProposalStore } from "@hooks/useProposal/store";
import { useMemo } from "react";
import { useShallow } from "zustand/shallow";

export interface ResolvedVoteEvents {
  voteEvents: ContestVoteEvent[];
  rankById: Map<string, number>;
  entryTitlesById: Map<string, string>;
  isLoading: boolean;
}

const EMPTY_EVENTS: ContestVoteEvent[] = [];

export const useResolvedVoteEvents = (): ResolvedVoteEvents => {
  const contestConfig = useContestConfigStore(useShallow(state => state.contestConfig));
  const { ledger, isLoading } = useContestVoteLedger();
  const voteEvents = ledger?.casts ?? EMPTY_EVENTS;

  const rankById = useProposalStore(
    useShallow(state => {
      const map = new Map<string, number>();
      for (const proposal of state.listProposalsData) map.set(proposal.id, proposal.rank);
      return map;
    }),
  );

  const storedTitlesById = useMemo(() => {
    const map = new Map<string, string>();
    for (const event of voteEvents) {
      if (event.proposalName) map.set(event.proposalId, event.proposalName);
    }
    return map;
  }, [voteEvents]);

  const unresolvedProposalIds = useMemo(
    () => voteEvents.filter(event => !storedTitlesById.has(event.proposalId)).map(event => event.proposalId),
    [voteEvents, storedTitlesById],
  );
  const { titlesById: fetchedTitlesById, resolvedIds } = useContestEntryTitles({
    contestConfig,
    proposalIds: unresolvedProposalIds,
    enabled: !!contestConfig.address && unresolvedProposalIds.length > 0,
  });

  const entryTitlesById = useMemo(() => {
    if (storedTitlesById.size === 0) return fetchedTitlesById;
    const merged = new Map(fetchedTitlesById);
    for (const [id, title] of storedTitlesById) merged.set(id, title);
    return merged;
  }, [fetchedTitlesById, storedTitlesById]);

  const resolvedVoteEvents = useMemo(
    () => voteEvents.filter(event => storedTitlesById.has(event.proposalId) || resolvedIds.has(event.proposalId)),
    [voteEvents, storedTitlesById, resolvedIds],
  );

  return { voteEvents: resolvedVoteEvents, rankById, entryTitlesById, isLoading };
};

export default useResolvedVoteEvents;
