import { EntryVotersResult } from "@hooks/useEntryVoters";
import { FC } from "react";
import { CHIP_CLASS_NAME } from "../constants";
import { formatVotersAriaLabel } from "../formatVotersLabel";
import { useEntryVotersSheet } from "../Sheet/context";
import EntryVotersChipFace from "./ChipFace";

interface EntryVotersSheetTriggerProps {
  proposalId: string;
  voters: Pick<EntryVotersResult, "topVoters" | "voterCount">;
  className?: string;
}

const EntryVotersSheetTrigger: FC<EntryVotersSheetTriggerProps> = ({ proposalId, voters, className = "" }) => {
  const { openFor } = useEntryVotersSheet();

  return (
    <button
      type="button"
      aria-label={formatVotersAriaLabel(voters.voterCount)}
      onPointerDown={event => event.stopPropagation()}
      onClick={event => {
        event.stopPropagation();
        openFor(proposalId);
      }}
      className={`${CHIP_CLASS_NAME} cursor-pointer focus:outline-none ${className}`}
    >
      <EntryVotersChipFace topVoters={voters.topVoters} voterCount={voters.voterCount} />
    </button>
  );
};

export default EntryVotersSheetTrigger;
