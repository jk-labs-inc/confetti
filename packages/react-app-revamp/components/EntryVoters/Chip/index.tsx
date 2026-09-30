import { FC } from "react";
import EntryVotersChipContent from "./ChipContent";

export interface EntryVotersChipProps {
  proposalId: string;
  enabled: boolean;
  reserveSpace?: boolean;
  className?: string;
}

const EntryVotersChip: FC<EntryVotersChipProps> = ({ proposalId, enabled, reserveSpace = false, className }) =>
  enabled ? <EntryVotersChipContent proposalId={proposalId} reserveSpace={reserveSpace} className={className} /> : null;

export default EntryVotersChip;
