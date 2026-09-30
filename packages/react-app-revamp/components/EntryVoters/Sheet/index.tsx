import Drawer from "@components/UI/Drawer";
import SegmentedControl, { SegmentedControlOption } from "@components/UI/SegmentedControl";
import { UPVOTE_GRADIENT } from "@components/VotingActionBar/constants";
import { useVotingFocusModeStore } from "@components/VotingActionBar/store";
import { useCastVotesStore } from "@hooks/useCastVotes/store";
import { ContestStatus, useContestStatusStore } from "@hooks/useContestStatus/store";
import { useVerifiedEntryVoters } from "@hooks/useEntryVoters/useVerifiedEntryVoters";
import { FC, useState } from "react";
import { SHEET_HEIGHT_PX, SHEET_MAX_ROWS } from "../constants";
import EntryVoterRow from "../Row";
import EntryVoterRowSkeleton from "../Row/RowSkeleton";
import EntryVotersSheetHeader from "./Header";
import { useSheetEntry } from "./useSheetEntry";

type EntryVotersSort = "top" | "recent";

interface EntryVotersSheetProps {
  proposalId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const SORT_OPTIONS: SegmentedControlOption<EntryVotersSort>[] = [
  { value: "top", label: "top" },
  { value: "recent", label: "recent" },
];

const SHEET_CLASS_NAME = "bg-[#121214] rounded-t-[28px]! border-neutral-5! border-x-0!";
const SHEET_CONTENT_STYLE = { height: `min(${SHEET_HEIGHT_PX}px, calc(100dvh - 48px))` };
const LIST_MASK_CLASS_NAME = "[mask-image:linear-gradient(180deg,#000_82%,transparent_100%)]";

const EntryVotersSheet: FC<EntryVotersSheetProps> = ({ proposalId, isOpen, onClose }) => {
  const [sort, setSort] = useState<EntryVotersSort>("top");
  const entry = useSheetEntry(proposalId);
  const { topVoters, recentVoters, voterCount, isLoading } = useVerifiedEntryVoters({
    proposalId: proposalId ?? "",
    topCount: SHEET_MAX_ROWS,
    enabled: isOpen && proposalId !== null,
  });
  const isVotingOpen = useContestStatusStore(state => state.contestStatus) === ContestStatus.VotingOpen;
  const setPickedProposal = useCastVotesStore(state => state.setPickedProposal);
  const voters = sort === "top" ? topVoters : recentVoters;

  const onBackEntry = () => {
    if (!proposalId) return;
    setPickedProposal(proposalId);
    onClose();
    useVotingFocusModeStore.getState().setIsFocusMode(true);
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} className={SHEET_CLASS_NAME} contentStyle={SHEET_CONTENT_STYLE}>
      <div className="flex h-full min-h-0 flex-col gap-3.5 px-4 pb-4">
        <EntryVotersSheetHeader entry={entry} voterCount={voterCount} onClose={onClose} />
        <SegmentedControl options={SORT_OPTIONS} value={sort} onChange={setSort} size="lg" />
        <div className={`no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain ${LIST_MASK_CLASS_NAME}`}>
          {voters.length === 0 && isLoading ? (
            <EntryVoterRowSkeleton />
          ) : (
            voters.map((voter, index) => (
              <EntryVoterRow key={voter.address} voter={voter} rank={index + 1} variant="sheet" />
            ))
          )}
        </div>
        {isVotingOpen ? (
          <button
            type="button"
            onClick={onBackEntry}
            className="h-12 shrink-0 rounded-[40px] text-[18px] font-bold normal-case text-true-black"
            style={{ backgroundImage: UPVOTE_GRADIENT }}
          >
            back this entry
          </button>
        ) : null}
      </div>
    </Drawer>
  );
};

export default EntryVotersSheet;
