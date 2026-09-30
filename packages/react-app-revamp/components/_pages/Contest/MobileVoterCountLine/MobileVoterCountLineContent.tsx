import { CHIP_MAX_FACES } from "@components/EntryVoters/constants";
import { pluralize } from "@helpers/pluralize";
import { useVerifiedEntryVoters } from "@hooks/useEntryVoters/useVerifiedEntryVoters";
import { FC } from "react";

interface MobileVoterCountLineContentProps {
  proposalId: string;
}

const MobileVoterCountLineContent: FC<MobileVoterCountLineContentProps> = ({ proposalId }) => {
  const { voterCount, isLoading } = useVerifiedEntryVoters({ proposalId, topCount: CHIP_MAX_FACES });

  if (isLoading && voterCount === 0) return null;

  return (
    <span className="text-neutral-9">{pluralize(voterCount, "voter", "voters")}</span>
  );
};

export default MobileVoterCountLineContent;
