import { FC } from "react";

interface ActivitySkeletonProps {
  count: number;
}

const ActivitySkeleton: FC<ActivitySkeletonProps> = ({ count }) => (
  <div className="flex flex-col gap-2">
    {Array.from({ length: count }, (_, index) => (
      <div key={index} className="h-[96px] w-full animate-pulse rounded-[15px] bg-neutral-2" />
    ))}
  </div>
);

export default ActivitySkeleton;
