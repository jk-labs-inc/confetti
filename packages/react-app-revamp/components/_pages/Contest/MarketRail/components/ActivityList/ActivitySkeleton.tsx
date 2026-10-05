import { FC } from "react";
import { ACTIVITY_ROW_HEIGHT_PX } from "./constants";

interface ActivitySkeletonProps {
  count: number;
}

const ActivitySkeleton: FC<ActivitySkeletonProps> = ({ count }) => (
  <div className="flex flex-col">
    {Array.from({ length: count }, (_, index) => (
      <div
        key={index}
        className="flex items-center gap-3 border-b border-neutral-4"
        style={{ height: ACTIVITY_ROW_HEIGHT_PX }}
      >
        <span className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-neutral-2" />
        <span className="h-3 flex-1 animate-pulse rounded-full bg-neutral-2" />
        <span className="h-3 w-12 shrink-0 animate-pulse rounded-full bg-neutral-2" />
      </div>
    ))}
  </div>
);

export default ActivitySkeleton;
