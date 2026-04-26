import { ContestStatus, useContestStatusStore } from "@hooks/useContestStatus/store";
import { EntryPreview } from "@hooks/useDeployContest/slices/contestMetadataSlice";
import React, { ReactNode, useMemo } from "react";
import { useMediaQuery } from "react-responsive";

interface ListProposalsContainerProps {
  enabledPreview: EntryPreview | null;
  children: ReactNode;
}

const TitleContainer = ({ children }: { children: ReactNode }) => {
  const contestStatus = useContestStatusStore(state => state.contestStatus);
  const isVotingActive =
    contestStatus === ContestStatus.VotingOpen || contestStatus === ContestStatus.VotingClosed;
  const hasEntries = React.Children.count(children) > 0;
  const gridCols = isVotingActive
    ? "grid-cols-[1fr_64px_48px] md:grid-cols-[1fr_120px_80px]"
    : "grid-cols-[1fr]";

  return (
    <div className="flex flex-col">
      {hasEntries && (
        <div
          className={`grid ${gridCols} items-center gap-4 md:gap-6 py-3 border-t border-b border-neutral-4`}
        >
          {isVotingActive ? (
            <>
              <p className="text-[16px] text-neutral-11 font-bold normal-case">entry</p>
              <p className="text-[16px] text-neutral-11 font-bold normal-case">votes</p>
              <div />
            </>
          ) : (
            <p className="text-[16px] text-neutral-11 font-bold normal-case">entry</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

const MasonryContainer = ({ children, columnCount }: { children: ReactNode; columnCount: number }) => {
  const columns = useMemo(() => {
    const cols: ReactNode[][] = Array.from({ length: columnCount }, () => []);
    React.Children.forEach(children, (child, index) => {
      cols[index % columnCount].push(child);
    });
    return cols;
  }, [children, columnCount]);

  return (
    <div className="flex gap-4">
      {columns.map((col, colIndex) => (
        <div key={colIndex} className="flex-1 flex flex-col gap-4">
          {col}
        </div>
      ))}
    </div>
  );
};

const ListProposalsContainer = ({ enabledPreview, children }: ListProposalsContainerProps) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  switch (enabledPreview) {
    case EntryPreview.TITLE:
      return <TitleContainer children={children} />;

    case EntryPreview.IMAGE:
    case EntryPreview.IMAGE_AND_TITLE:
    case EntryPreview.TWEET:
    case EntryPreview.TWEET_AND_TITLE:
      return <MasonryContainer children={children} columnCount={isMobile ? 1 : 2} />;

    default:
      return <TitleContainer children={children} />;
  }
};

export default ListProposalsContainer;
