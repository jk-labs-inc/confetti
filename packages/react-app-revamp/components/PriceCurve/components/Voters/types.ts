import { ContestVoteEvent } from "@hooks/useContestVoteLedger";

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
  rankById: Map<string, number>;
  formatPrice: (nativePrice: number) => string;
  entryTitlesById: Map<string, string>;
  isLive: boolean;
  showHeader?: boolean;
  isInteractive?: boolean;
}
