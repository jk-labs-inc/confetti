import ListProposals from "@components/_pages/ListProposals";
import { ContestStatus, useContestStatusStore } from "@hooks/useContestStatus/store";
import { FC, useState } from "react";
import { useEntriesReady } from "../../hooks/useEntriesReady";
import { EntriesScrollRootContext, InEntriesColumnContext } from "./context";
import EntriesBelowFoldHint from "./EntriesBelowFoldHint";

const WINNER_OVERHANG_ROOM_CLASS_NAME = "-mt-3 pt-3 -mx-1 px-1";

interface ContestEntriesColumnProps {
  scrollMode: "viewport" | "page";
}

const ContestEntriesColumn: FC<ContestEntriesColumnProps> = ({ scrollMode }) => {
  const [scrollRoot, setScrollRoot] = useState<HTMLDivElement | null>(null);
  const isReady = useEntriesReady();
  const isVotingClosed = useContestStatusStore(state => state.contestStatus) === ContestStatus.VotingClosed;
  const entries = isReady ? (
    <InEntriesColumnContext.Provider value>
      <div className="animate-fade-in">
        <ListProposals />
      </div>
    </InEntriesColumnContext.Provider>
  ) : null;

  if (scrollMode === "page") {
    return <div className="min-w-0">{entries}</div>;
  }

  return (
    <EntriesScrollRootContext.Provider value={scrollRoot}>
      <div className="flex-1 min-h-0 min-w-0 flex flex-col">
        <div
          ref={setScrollRoot}
          className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden no-scrollbar ${
            isVotingClosed ? WINNER_OVERHANG_ROOM_CLASS_NAME : ""
          }`}
        >
          {entries}
        </div>
        <EntriesBelowFoldHint scrollRoot={scrollRoot} />
      </div>
    </EntriesScrollRootContext.Provider>
  );
};

export default ContestEntriesColumn;
