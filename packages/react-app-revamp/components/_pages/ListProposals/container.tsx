import { EntryPreview } from "@hooks/useDeployContest/slices/contestMetadataSlice";
import React, { ReactNode, useMemo } from "react";
import { useMediaQuery } from "react-responsive";

interface ListProposalsContainerProps {
  enabledPreview: EntryPreview | null;
  children: ReactNode;
}

const TitleContainer = ({ children }: { children: ReactNode }) => <div className="flex flex-col gap-4">{children}</div>;

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
