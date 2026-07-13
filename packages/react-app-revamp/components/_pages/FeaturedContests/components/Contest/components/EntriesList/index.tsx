import useScrollFade from "@hooks/useScrollFade";
import { FC, useRef } from "react";
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { shouldApplyFade, maskImageStyle } = useScrollFade(scrollContainerRef, entries.length, [entries, isExpanded]);
  const isEnded = cardState === "ended" || cardState === "canceled";
  // mobile shows 3 rows, so only >3 needs the button there; desktop shows 2, so exactly 3 needs it too.
  const loadAllClass =
    totalEntries > COLLAPSED_ENTRIES_COUNT
      ? "flex"
      : totalEntries === COLLAPSED_ENTRIES_COUNT
        ? "hidden md:flex"
        : null;

  return (
    <div className="h-[164px] md:h-[116px] flex flex-col gap-4">
      {isLoading ? (
        <>
          <EntryRowSkeleton />
          <EntryRowSkeleton />
          <EntryRowSkeleton className="md:hidden" />
        </>
      ) : entries.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-neutral-9">no entries yet</p>
        </div>
      ) : isExpanded ? (
        <div
          ref={scrollContainerRef}
          className="flex-1 min-h-0 flex flex-col gap-2 overflow-y-auto no-scrollbar"
          style={shouldApplyFade ? { maskImage: maskImageStyle, WebkitMaskImage: maskImageStyle } : undefined}
        >
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
          {entries.map((entry, index) => (
            <EntryRow
              key={entry.id}
              entry={entry}
              contestUrl={contestUrl}
              cardState={cardState}
              hasEntryImages={hasEntryImages}
              onVoteClick={onVoteClick}
              className={index === COLLAPSED_ENTRIES_COUNT - 1 ? "md:hidden" : ""}
            />
          ))}
          {loadAllClass && <LoadAllButton onClick={onLoadAll} isEnded={isEnded} className={loadAllClass} />}
        </>
      )}
    </div>
  );
};

export default EntriesList;
