import { EntryVoter } from "@hooks/useEntryVoters";
import { FC } from "react";
import { CHIP_LABEL_CLASS_NAME } from "../constants";
import { formatVotersLabel } from "../formatVotersLabel";
import EntryVotersChipAvatar from "./ChipAvatar";

interface EntryVotersChipFaceProps {
  topVoters: EntryVoter[];
  voterCount: number;
}

const EntryVotersChipFace: FC<EntryVotersChipFaceProps> = ({ topVoters, voterCount }) => {
  const label = formatVotersLabel(voterCount);

  return (
    <>
      <span className="flex items-center">
        {topVoters.map((voter, index) => (
          <EntryVotersChipAvatar key={voter.address} address={voter.address} isStacked={index > 0} />
        ))}
      </span>
      {label ? <span className={CHIP_LABEL_CLASS_NAME}>{label}</span> : null}
    </>
  );
};

export default EntryVotersChipFace;
