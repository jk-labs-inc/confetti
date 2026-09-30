import { useVoteFlowPresentation } from "@components/Voting/VoteFlow/components/Shell";
import { useVerifiedEntryVoters } from "@hooks/useEntryVoters/useVerifiedEntryVoters";
import { FC } from "react";
import { CHIP_MAX_FACES } from "../constants";
import EntryVotersChipPlaceholder from "./ChipPlaceholder";
import EntryVotersPopoverTrigger from "./PopoverTrigger";
import EntryVotersSheetTrigger from "./SheetTrigger";

interface EntryVotersChipContentProps {
  proposalId: string;
  reserveSpace: boolean;
  className?: string;
}

const EntryVotersChipContent: FC<EntryVotersChipContentProps> = ({ proposalId, reserveSpace, className }) => {
  const voters = useVerifiedEntryVoters({ proposalId, topCount: CHIP_MAX_FACES });
  const { usesDrawer } = useVoteFlowPresentation();

  if (voters.isLoading && voters.voterCount === 0) {
    return reserveSpace ? <EntryVotersChipPlaceholder className={className} /> : null;
  }
  if (voters.voterCount === 0) return null;

  return usesDrawer ? (
    <EntryVotersSheetTrigger proposalId={proposalId} voters={voters} className={className} />
  ) : (
    <EntryVotersPopoverTrigger proposalId={proposalId} voters={voters} className={className} />
  );
};

export default EntryVotersChipContent;
