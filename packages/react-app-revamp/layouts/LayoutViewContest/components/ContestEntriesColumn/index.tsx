import ListProposals from "@components/_pages/ListProposals";
import { ContestStatus, useContestStatusStore } from "@hooks/useContestStatus/store";
import { CSSProperties, FC, ReactNode, useState } from "react";
import { useEntriesReady } from "../../hooks/useEntriesReady";
import { EntriesScrollRootContext, InEntriesColumnContext } from "./context";

const WINNER_OVERHANG_ROOM_CLASS_NAME = "-mt-3 pt-3 -mx-1 px-1";
const BOTTOM_FADE = "linear-gradient(to bottom, #000 calc(100% - 3rem), transparent)";
const BOTTOM_FADE_STYLE: CSSProperties = { maskImage: BOTTOM_FADE, WebkitMaskImage: BOTTOM_FADE };

interface ContestEntriesColumnProps {
  scrollMode: "viewport" | "page";
  header?: ReactNode;
}

const ContestEntriesColumn: FC<ContestEntriesColumnProps> = ({ scrollMode, header }) => {
  const [scrollRoot, setScrollRoot] = useState<HTMLDivElement | null>(null);
  const isReady = useEntriesReady();
  const isVotingClosed = useContestStatusStore(state => state.contestStatus) === ContestStatus.VotingClosed;
  const entries = isReady ? (
    <InEntriesColumnContext.Provider value>
      <ListProposals />
    </InEntriesColumnContext.Provider>
  ) : null;

  if (scrollMode === "page") {
    return <div className="min-w-0">{entries}</div>;
  }

  return (
    <EntriesScrollRootContext.Provider value={scrollRoot}>
      <div
        ref={setScrollRoot}
        className={`flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden no-scrollbar pb-12 ${
          isVotingClosed ? WINNER_OVERHANG_ROOM_CLASS_NAME : ""
        }`}
        style={BOTTOM_FADE_STYLE}
      >
        {header && <div className="mb-2 wide:mb-2.5 empty:hidden">{header}</div>}
        {entries}
      </div>
    </EntriesScrollRootContext.Provider>
  );
};

export default ContestEntriesColumn;
