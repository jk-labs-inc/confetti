import { EntryPreview } from "@hooks/useDeployContest/slices/contestMetadataSlice";
import { forwardRef } from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

interface ListProposalsSkeletonProps {
  enabledPreview: EntryPreview | null;
  highlightColor: string;
  count?: number;
}

const ProposalSkeleton = forwardRef<HTMLDivElement, { highlightColor: string; children: React.ReactNode }>(
  ({ highlightColor, children }, ref) => (
    <SkeletonTheme baseColor="#141414" highlightColor={highlightColor} duration={1}>
      <div ref={ref}>{children}</div>
    </SkeletonTheme>
  ),
);

ProposalSkeleton.displayName = "ProposalSkeleton";

const ListProposalsSkeleton = forwardRef<HTMLDivElement, ListProposalsSkeletonProps>(
  ({ enabledPreview, highlightColor, count = 1 }, ref) => {
    switch (enabledPreview) {
      case EntryPreview.TITLE:
        return (
          <ProposalSkeleton ref={ref} highlightColor={highlightColor}>
            <Skeleton
              borderRadius={4}
              count={count}
              className="flex flex-col w-full h-[60px] md:h-[72px] animate-appear"
            />
          </ProposalSkeleton>
        );
      case EntryPreview.IMAGE:
      case EntryPreview.IMAGE_AND_TITLE:
      case EntryPreview.TWEET:
        return (
          <ProposalSkeleton ref={ref} highlightColor={highlightColor}>
            <div className="flex flex-col gap-4">
              <Skeleton borderRadius={16} className="flex flex-col w-full h-52 animate-appear rounded-2xl" />
            </div>
          </ProposalSkeleton>
        );
      default:
        return (
          <ProposalSkeleton ref={ref} highlightColor={highlightColor}>
            <Skeleton
              borderRadius={10}
              count={count}
              className="flex flex-col w-full h-80 animate-appear rounded-[10px] mt-3"
            />
          </ProposalSkeleton>
        );
    }
  },
);

ListProposalsSkeleton.displayName = "ListProposalsSkeleton";

export default ListProposalsSkeleton;
