import { FC } from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

interface EntryVoterRowSkeletonProps {
  rows?: number;
}

const DEFAULT_SKELETON_ROWS = 3;

const EntryVoterRowSkeleton: FC<EntryVoterRowSkeletonProps> = ({ rows = DEFAULT_SKELETON_ROWS }) => (
  <SkeletonTheme baseColor="#1e1e1e" highlightColor="#2e2e32" duration={1}>
    <div className="flex flex-col gap-2 py-2">
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} height={24} borderRadius={8} />
      ))}
    </div>
  </SkeletonTheme>
);

export default EntryVoterRowSkeleton;
