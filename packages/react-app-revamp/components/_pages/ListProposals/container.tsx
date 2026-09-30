import GalleryImageShapeProvider from "@components/_pages/ProposalContent/components/ProposalLayout/Gallery/ImageShape/Provider";
import {
  CONTAINED_ROW_INSET_CLASS_NAME,
  RANKED_VOTING_GRID_CLASS_NAME,
  useLeaderboardTableLayout,
} from "@components/_pages/ProposalContent/components/ProposalLayout/Leaderboard/useLeaderboardTableLayout";
import { ContestStatus, useContestStatusStore } from "@hooks/useContestStatus/store";
import { MOBILE_MAX_WIDTH_PX } from "@helpers/isMobileViewport";
import { EntryPreview } from "@hooks/useDeployContest/slices/contestMetadataSlice";
import React, { ReactNode, useMemo } from "react";
import { useMediaQuery } from "react-responsive";

interface ListProposalsContainerProps {
  enabledPreview: EntryPreview | null;
  children: ReactNode;
}

const TitleContainer = ({ children }: { children: ReactNode }) => {
  const contestStatus = useContestStatusStore(state => state.contestStatus);
  const isVotingActive = contestStatus === ContestStatus.VotingOpen || contestStatus === ContestStatus.VotingClosed;
  const hasEntries = React.Children.count(children) > 0;
  const { isContained, showInlineRank } = useLeaderboardTableLayout(isVotingActive);
  const votingGridCols = showInlineRank
    ? RANKED_VOTING_GRID_CLASS_NAME
    : "grid-cols-[1fr_64px_48px] md:grid-cols-[1fr_120px_80px_80px] lg:grid-cols-[1fr_120px_80px]";
  const gridCols = isVotingActive ? votingGridCols : "grid-cols-[1fr]";

  return (
    <div className="flex flex-col">
      {hasEntries && (
        <div
          className={`grid ${gridCols} items-center gap-4 md:gap-6 py-3 ${
            isContained ? CONTAINED_ROW_INSET_CLASS_NAME : ""
          } border-b border-neutral-4`}
        >
          {isVotingActive ? (
            <>
              {showInlineRank && <div />}
              <p className="text-[16px] text-neutral-10 font-bold normal-case">entry</p>
              <p className="text-[16px] text-neutral-10 font-bold normal-case">votes</p>
              <p className="hidden md:block text-[16px] text-neutral-10 font-bold normal-case">% of votes</p>
              <div className="lg:hidden" />
            </>
          ) : (
            <p className="text-[16px] text-neutral-10 font-bold normal-case">entry</p>
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
    <div className="flex gap-3 wide:gap-3.5">
      {columns.map((col, colIndex) => (
        <div key={colIndex} className="flex-1 flex flex-col gap-3 wide:gap-3.5">
          {col}
        </div>
      ))}
    </div>
  );
};

const ListProposalsContainer = ({ enabledPreview, children }: ListProposalsContainerProps) => {
  const isMobile = useMediaQuery({ maxWidth: MOBILE_MAX_WIDTH_PX });

  switch (enabledPreview) {
    case EntryPreview.TITLE:
      return <TitleContainer children={children} />;

    case EntryPreview.IMAGE:
    case EntryPreview.IMAGE_AND_TITLE:
      return (
        <GalleryImageShapeProvider>
          <MasonryContainer children={children} columnCount={isMobile ? 1 : 2} />
        </GalleryImageShapeProvider>
      );

    case EntryPreview.TWEET:
    case EntryPreview.TWEET_AND_TITLE:
      return <MasonryContainer children={children} columnCount={isMobile ? 1 : 2} />;

    default:
      return <TitleContainer children={children} />;
  }
};

export default ListProposalsContainer;
