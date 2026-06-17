import { ContestVoteEvent } from "@hooks/useContestVoteMarkers";

export interface PositionedVote extends ContestVoteEvent {
  x: number;
  totalCost: number;
}

export interface AvatarCluster {
  x: number;
  voters: PositionedVote[];
}
