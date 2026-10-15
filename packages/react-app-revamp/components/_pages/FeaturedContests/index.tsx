import { CONTESTS_FEATURE_COUNT } from "lib/contests/constants";
import { FC } from "react";
import FeaturedContestCard from "./components/Contest";
import FeaturedContestsEmptyState from "./components/EmptyState";
import FeaturedContestsErrorState from "./components/ErrorState";
import PeekCard from "./components/PeekCard";
import SkeletonCard from "./components/SkeletonCard";
import { FeaturedContestItem } from "./ranking";

interface FeaturedContestsProps {
  status: "error" | "pending" | "success";
  isContestDataFetching: boolean;
  isRewardsFetching: boolean;
  contests: FeaturedContestItem[];
  onRetry: () => void;
}

const FeaturedContests: FC<FeaturedContestsProps> = ({
  status,
  contests,
  isRewardsFetching,
  isContestDataFetching,
  onRetry,
}) => {
  const isEmpty = status === "success" && !isContestDataFetching && !contests.length;

  return (
    <div className="flex flex-col gap-4 max-md:px-2">
      <p className="text-neutral-9 font-sabo-filled text-xs block md:hidden">featured contests</p>
      {status === "error" ? (
        <FeaturedContestsErrorState onRetry={onRetry} isRetrying={isContestDataFetching} />
      ) : isEmpty ? (
        <FeaturedContestsEmptyState />
      ) : (
        <div className="flex flex-col md:grid md:grid-cols-(--grid-featured-contests) gap-6 pb-4">
          {contests.map(({ key, contest, rewards }, index) => (
            <PeekCard key={key} isPeek={index === 0}>
              <FeaturedContestCard contestData={contest} rewardsData={rewards} isRewardsFetching={isRewardsFetching} />
            </PeekCard>
          ))}

          {isContestDataFetching &&
            Array.from({
              length: Math.max(0, CONTESTS_FEATURE_COUNT - contests.length),
            }).map((_, index) => <SkeletonCard key={`skeleton-${index}`} />)}
        </div>
      )}
    </div>
  );
};

export default FeaturedContests;
