import { ContestVoteEvent } from "@hooks/useContestVoteMarkers";
import { ChartDataPoint } from "../../types";
import { MERGE_PX } from "./constants";
import { AvatarCluster, PositionedVote } from "./types";

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const clusterKey = (cluster: AvatarCluster): string => cluster.voters[0].uuid;

const findPointIndex = (times: number[], t: number): number => {
  const last = times.length - 1;
  if (t <= times[0]) return 0;
  if (t >= times[last]) return last;
  let lo = 0;
  let hi = last;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (times[mid] <= t) lo = mid;
    else hi = mid - 1;
  }
  return lo;
};

export function buildAvatarClusters(
  voteEvents: ContestVoteEvent[],
  data: ChartDataPoint[],
  getX: (d: ChartDataPoint) => number,
): AvatarCluster[] {
  if (voteEvents.length === 0 || data.length === 0) return [];

  const times = data.map(d => new Date(d.date).getTime());
  const n = data.length;

  const positioned: PositionedVote[] = voteEvents.map(vote => {
    const t = vote.createdAt * 1000;
    const i = findPointIndex(times, t);

    let x: number;
    let curvePrice: number;
    if (i < n - 1 && times[i + 1] > times[i]) {
      const f = clamp((t - times[i]) / (times[i + 1] - times[i]), 0, 1);
      x = getX(data[i]) + f * (getX(data[i + 1]) - getX(data[i]));
      curvePrice = data[i].pv + f * (data[i + 1].pv - data[i].pv);
    } else {
      x = getX(data[i]);
      curvePrice = data[i].pv;
    }

    const totalCost = vote.amountSent != null ? vote.amountSent : curvePrice * vote.voteAmount;

    return { ...vote, x, totalCost };
  });

  positioned.sort((a, b) => a.x - b.x);

  const clusters: AvatarCluster[] = [];
  for (const vote of positioned) {
    const group = clusters[clusters.length - 1];
    if (group && vote.x - group.x <= MERGE_PX) {
      group.voters.push(vote);
    } else {
      clusters.push({ x: vote.x, voters: [vote] });
    }
  }

  for (const cluster of clusters) cluster.voters.sort((a, b) => a.createdAt - b.createdAt);
  return clusters;
}
