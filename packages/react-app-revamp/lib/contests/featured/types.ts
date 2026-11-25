import type { BaseContestData, ContestDetails } from "lib/contests/types";
import type { TotalRewardsData } from "lib/rewards/types";

export type FeaturedPool = { status: "none" } | { status: "read"; totals: TotalRewardsData } | { status: "unread" };

export interface FeaturedContestEntry {
  row: BaseContestData;
  details: ContestDetails | null;
  pool: FeaturedPool;
}

export interface FeaturedSnapshot {
  fetchedAt: number;
  contests: FeaturedContestEntry[];
}
