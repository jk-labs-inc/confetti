import { buildPositionedVotes } from "@components/PriceCurve/components/Voters/buildPositionedVotes";
import { PositionedVote } from "@components/PriceCurve/components/Voters/types";
import usePriceCurveConfig from "@hooks/usePriceCurveConfig";
import { useResolvedVoteEvents } from "@hooks/useResolvedVoteEvents";
import { useMemo } from "react";

export interface ContestActivityFeed {
  votes: PositionedVote[];
  rankById: Map<string, number>;
  entryTitlesById: Map<string, string>;
  isLoading: boolean;
}

interface UseContestActivityFeedParams {
  latestCount?: number;
}

const ZERO_X = () => 0;
const ZERO_Y = () => 0;

export const useContestActivityFeed = ({ latestCount }: UseContestActivityFeedParams = {}): ContestActivityFeed => {
  const { voteEvents: allVoteEvents, rankById, entryTitlesById, isLoading: isEventsLoading } = useResolvedVoteEvents();
  const { chartData, isLoading: isCurveLoading, isError: isCurveError } = usePriceCurveConfig();

  const voteEvents = useMemo(
    () => (latestCount === undefined ? allVoteEvents : allVoteEvents.slice(-latestCount)),
    [allVoteEvents, latestCount],
  );

  const votes = useMemo<PositionedVote[]>(() => {
    if (isCurveError || chartData.length === 0) {
      return voteEvents.map(vote => ({ ...vote, x: 0, y: 0, totalCost: vote.amountSent ?? 0 }));
    }
    return buildPositionedVotes(voteEvents, chartData, ZERO_X, ZERO_Y);
  }, [voteEvents, chartData, isCurveError]);

  return {
    votes,
    rankById,
    entryTitlesById,
    isLoading: isEventsLoading || (isCurveLoading && !isCurveError),
  };
};

export default useContestActivityFeed;
