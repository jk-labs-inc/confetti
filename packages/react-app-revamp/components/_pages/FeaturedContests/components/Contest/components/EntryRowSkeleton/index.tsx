import { FC } from "react";
import Skeleton from "react-loading-skeleton";

interface EntryRowSkeletonProps {
  className?: string;
}

const EntryRowSkeleton: FC<EntryRowSkeletonProps> = ({ className }) => {
  return (
    <div className={`flex items-center gap-3 h-10 shrink-0 ${className ?? ""}`}>
      <Skeleton width={36} height={36} borderRadius={6} baseColor="#212121" highlightColor="#100816" />
      <div className="flex-1">
        <Skeleton height={14} borderRadius={4} baseColor="#212121" highlightColor="#100816" />
      </div>
    </div>
  );
};

export default EntryRowSkeleton;
