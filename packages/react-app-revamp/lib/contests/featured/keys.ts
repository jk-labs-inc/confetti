import type { ContestRef } from "lib/contests/types";

export const featuredContestKey = (contest: ContestRef): string => `${contest.network_name}:${contest.address}`;

export const featuredContestRewardsQueryKey = (contest: ContestRef) =>
  ["totalRewards", "contest", contest.network_name, contest.address] as const;

export const featuredContestDetailsQueryKey = (contest: ContestRef) =>
  ["featuredContest", contest.network_name, contest.address] as const;
