import { FC } from "react";
import FeaturedContestCard from "./components/Contest";
import FeaturedContestsEmptyState from "./components/EmptyState";
import FeaturedContestsErrorState from "./components/ErrorState";
import PeekCard from "./components/PeekCard";
import SkeletonCard from "./components/SkeletonCard";
import { FeaturedContestItem } from "./ranking";

interface FeaturedContestsProps {
  status: "error" | "pending" | "success";
  contests: FeaturedContestItem[];
  pendingCount: number;
  isRewardsFetching: boolean;
  isRetrying: boolean;
  onRetry: () => void;
}

const FeaturedContests: FC<FeaturedContestsProps> = ({
  status,
  contests,
  pendingCount,
  isRewardsFetching,
  isRetrying,
  onRetry,
}) => {
  const isEmpty = status === "success" && pendingCount === 0 && !contests.length;

  return (
    <div className="flex flex-col gap-4 max-md:px-2">
      <p className="text-neutral-9 font-sabo-filled text-xs block md:hidden">featured contests</p>
      {status === "error" ? (
        <FeaturedContestsErrorState onRetry={onRetry} isRetrying={isRetrying} />
      ) : isEmpty ? (
        <FeaturedContestsEmptyState />
      ) : (
        <div className="flex flex-col md:grid md:grid-cols-(--grid-featured-contests) gap-6 pt-6 pb-4">
          {contests.map(({ key, contest, rewards }, index) => (
            <PeekCard key={key} isPeek={index === 0}>
              <FeaturedContestCard contestData={contest} rewardsData={rewards} isRewardsFetching={isRewardsFetching} />
            </PeekCard>
          ))}

          {Array.from({ length: pendingCount }).map((_, index) => (
            <SkeletonCard key={`skeleton-${index}`} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeaturedContests;
