import { ContestVoteEvent } from "@hooks/useContestVoteMarkers";

export interface PositionedVote extends ContestVoteEvent {
  x: number;
  y: number;
  totalCost: number;
}

export interface VoterCluster {
  voters: PositionedVote[];
}

export interface VoterRibbonProps {
  votes: PositionedVote[];
  entryColors: Map<string, string>;
  formatPrice: (nativePrice: number) => string;
  entryTitlesById: Map<string, string>;
  isLive: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}
