import { useVerifiedEntryVoters } from "@hooks/useEntryVoters/useVerifiedEntryVoters";
import { FC, useState } from "react";
import { POPOVER_MAX_ROWS, POPOVER_PREVIEW_ROWS } from "../constants";
import EntryVoterRow from "../Row";
import EntryVoterRowSkeleton from "../Row/RowSkeleton";

interface EntryVotersPopoverProps {
  proposalId: string;
}

const EntryVotersPopover: FC<EntryVotersPopoverProps> = ({ proposalId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { topVoters, voterCount, isLoading } = useVerifiedEntryVoters({ proposalId, topCount: POPOVER_MAX_ROWS });
  const rows = isExpanded ? topVoters : topVoters.slice(0, POPOVER_PREVIEW_ROWS);
  const canExpand = !isExpanded && voterCount > POPOVER_PREVIEW_ROWS;

  return (
    <div className="w-[320px] px-4 pb-1 pt-4" onClick={event => event.stopPropagation()}>
      <div className="flex items-baseline gap-1.5">
        <p className="text-[18px] font-bold normal-case text-neutral-11">voters</p>
        <p className="text-[14px] font-bold tabular-nums text-neutral-9">({voterCount})</p>
      </div>
      <div className={isExpanded ? "no-scrollbar max-h-[60vh] overflow-y-auto overscroll-contain" : ""}>
        {rows.length === 0 && isLoading ? (
          <EntryVoterRowSkeleton />
        ) : (
          rows.map((voter, index) => (
            <EntryVoterRow key={voter.address} voter={voter} rank={index + 1} variant="popover" />
          ))
        )}
      </div>
      {canExpand ? (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="h-12 w-full border-t border-primary-2 text-center text-[14px] font-bold normal-case text-neutral-11"
        >
          see all {voterCount} voters ›
        </button>
      ) : null}
    </div>
  );
};

export default EntryVotersPopover;
