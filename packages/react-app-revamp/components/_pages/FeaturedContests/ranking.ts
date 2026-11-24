import { featuredContestKey } from "lib/contests/featured/keys";
import { ContestWithTotalRewards, ProcessedContest } from "lib/contests/types";
import moment from "moment";
import { getCardState } from "./components/Contest/helpers";
import { CardState } from "./components/Contest/types";

export interface FeaturedContestItem {
  key: string;
  contest: ProcessedContest;
  rewards?: ContestWithTotalRewards;
}

type Phase = "live" | "upcoming" | "past";

const PHASE_BY_CARD_STATE: Record<CardState, Phase> = {
  live: "live",
  upcoming: "upcoming",
  ended: "past",
  canceled: "past",
};

const PHASE_ORDER: Record<Phase, number> = { live: 0, upcoming: 1, past: 2 };

const COMPARE_TIMING: Record<Phase, (a: ProcessedContest, b: ProcessedContest) => number> = {
  live: (a, b) => moment(a.end_at).diff(b.end_at),
  upcoming: (a, b) => moment(a.vote_start_at).diff(b.vote_start_at),
  past: (a, b) => moment(b.end_at).diff(a.end_at),
};

interface RankFeaturedContestsArgs {
  contests: ProcessedContest[];
  rewardsByKey: Record<string, ContestWithTotalRewards> | undefined;
  poolUsdByKey: Record<string, number> | null;
}

export const rankFeaturedContests = ({
  contests,
  rewardsByKey,
  poolUsdByKey,
}: RankFeaturedContestsArgs): FeaturedContestItem[] =>
  contests
    .map(contest => {
      const key = featuredContestKey(contest);
      return {
        key,
        contest,
        rewards: rewardsByKey?.[key],
        phase: PHASE_BY_CARD_STATE[getCardState(contest)],
        poolUsd: poolUsdByKey?.[key] ?? 0,
      };
    })
    .sort(
      (a, b) =>
        PHASE_ORDER[a.phase] - PHASE_ORDER[b.phase] ||
        b.poolUsd - a.poolUsd ||
        COMPARE_TIMING[a.phase](a.contest, b.contest),
    )
    .map(({ key, contest, rewards }) => ({ key, contest, rewards }));
