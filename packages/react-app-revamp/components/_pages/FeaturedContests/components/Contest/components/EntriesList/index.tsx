import { FC } from "react";
import { COLLAPSED_ENTRIES_COUNT } from "../../hooks/useContestCardEntries";
import { CardEntry, CardState } from "../../types";
import EntryRow from "../EntryRow";
import EntryRowSkeleton from "../EntryRowSkeleton";
import LoadAllButton from "../LoadAllButton";

interface EntriesListProps {
  contestUrl: string;
  entries: CardEntry[];
  totalEntries: number;
  cardState: CardState;
  hasEntryImages: boolean;
  isLoading: boolean;
  isExpanded: boolean;
  onLoadAll: () => void;
  onVoteClick: (entry: CardEntry) => void;
}

const EntriesList: FC<EntriesListProps> = ({
  contestUrl,
  entries,
  totalEntries,
  cardState,
  hasEntryImages,
  isLoading,
  isExpanded,
  onLoadAll,
  onVoteClick,
}) => {
  const isEnded = cardState === "ended" || cardState === "canceled";
  const showLoadAll = totalEntries > COLLAPSED_ENTRIES_COUNT;
  const needsExplicitHeight = isLoading || isExpanded || entries.length === 0;
  const spacing = needsExplicitHeight ? "h-[112px]" : showLoadAll ? "" : "mb-6";

  return (
    <div className={`flex flex-col gap-2 ${spacing}`}>
      {isLoading ? (
        <>
          <EntryRowSkeleton />
          <EntryRowSkeleton />
        </>
      ) : entries.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-neutral-9">no entries yet</p>
        </div>
      ) : isExpanded ? (
        <div className="flex-1 min-h-0 flex flex-col gap-1 overflow-y-auto overscroll-y-contain no-scrollbar">
          {entries.map(entry => (
            <EntryRow
              key={entry.id}
              entry={entry}
              contestUrl={contestUrl}
              cardState={cardState}
              hasEntryImages={hasEntryImages}
              onVoteClick={onVoteClick}
            />
          ))}
        </div>
      ) : (
        <>
          {entries.map(entry => (
            <EntryRow
              key={entry.id}
              entry={entry}
              contestUrl={contestUrl}
              cardState={cardState}
              hasEntryImages={hasEntryImages}
              onVoteClick={onVoteClick}
            />
          ))}
          {showLoadAll && <LoadAllButton onClick={onLoadAll} isEnded={isEnded} />}
        </>
      )}
    </div>
  );
};

export default EntriesList;
