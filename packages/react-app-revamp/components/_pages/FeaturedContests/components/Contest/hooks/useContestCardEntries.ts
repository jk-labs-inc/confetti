import useContestCardConfig from "@hooks/useContestCardConfig";
import useContestCardRealtime from "@hooks/useContestCardRealtime";
import useContestEntriesPreviews from "@hooks/useContestEntriesPreviews";
import useContestEntriesVotes from "@hooks/useContestEntriesVotes";
import { EntryPreview } from "@hooks/useDeployContest/slices/contestMetadataSlice";
import { ProcessedContest } from "lib/contests/types";
import { useMemo, useState } from "react";
import { CardEntry, CardState } from "../types";

/** Rows fetched while collapsed: mobile shows all 3, desktop hides the 3rd via CSS. */
export const COLLAPSED_ENTRIES_COUNT = 3;

export function useContestCardEntries(contest: ProcessedContest, cardState: CardState) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { config, isLoading: isConfigLoading } = useContestCardConfig({
    address: contest.address,
    chainName: contest.network_name,
  });

  const {
    entries: votedEntries,
    totalVotes,
    hasVoteData,
    isLoading: isVotesLoading,
  } = useContestEntriesVotes({ config });

  useContestCardRealtime({
    address: contest.address,
    chainName: contest.network_name,
    chainId: config?.chainId,
    enabled: !!config && (cardState === "live" || cardState === "upcoming"),
  });

  // Once voting has opened, rank by votes (stable sort keeps contract order on ties);
  // before that, natural contract order — same policy the contest page uses.
  const sortedEntries = useMemo(() => {
    if (cardState === "upcoming" || !hasVoteData) return votedEntries;
    return [...votedEntries].sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0));
  }, [votedEntries, cardState, hasVoteData]);

  const visibleIds = useMemo(() => {
    const sliced = isExpanded ? sortedEntries : sortedEntries.slice(0, COLLAPSED_ENTRIES_COUNT);
    return sliced.map(entry => entry.id);
  }, [sortedEntries, isExpanded]);

  const { previewsById } = useContestEntriesPreviews({ config, proposalIds: visibleIds });

  const entries: CardEntry[] = useMemo(() => {
    const showPercents = hasVoteData && cardState !== "upcoming";
    return visibleIds.map(id => {
      const votes = sortedEntries.find(entry => entry.id === id)?.votes ?? null;
      const preview = previewsById.get(id);
      return {
        id,
        votes,
        percent: showPercents ? (totalVotes > 0 ? (Math.max(0, votes ?? 0) / totalVotes) * 100 : 0) : null,
        title: preview?.title?.trim() || undefined,
        image: preview?.image,
      };
    });
  }, [visibleIds, sortedEntries, previewsById, hasVoteData, cardState, totalVotes]);

  // title-only (and tweet) contests render no thumbnail column at all.
  const hasEntryImages =
    config?.enabledPreview === EntryPreview.IMAGE || config?.enabledPreview === EntryPreview.IMAGE_AND_TITLE;

  return {
    entries,
    totalEntries: sortedEntries.length,
    hasVoteData,
    hasEntryImages,
    isLoading: isConfigLoading || isVotesLoading,
    isExpanded,
    loadAll: () => setIsExpanded(true),
    config,
  };
}

export default useContestCardEntries;
