import { FC } from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

interface LeaderboardSkeletonProps {
  count: number;
}

const LeaderboardSkeleton: FC<LeaderboardSkeletonProps> = ({ count }) => (
  <SkeletonTheme baseColor="#706f78" highlightColor="#bb65ff" duration={1}>
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex items-center justify-between border-b border-neutral-4 pb-2">
          <div className="flex items-center gap-2">
            <Skeleton circle height={24} width={24} />
            <Skeleton width={90} height={12} />
          </div>
          <Skeleton width={44} height={12} />
        </div>
      ))}
    </div>
  </SkeletonTheme>
);

export default LeaderboardSkeleton;
