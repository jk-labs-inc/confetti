import { FC } from "react";
import { useMobileLeaderboardOptional } from "../MobileLeaderboard/context";
import MobileVoterCountLineContent from "./MobileVoterCountLineContent";

interface MobileVoterCountLineProps {
  proposalId: string;
  className?: string;
}

const MobileVoterCountLine: FC<MobileVoterCountLineProps> = ({ proposalId, className = "" }) => {
  const hasLeaderboard = !!useMobileLeaderboardOptional();

  if (!hasLeaderboard) return null;

  return (
    <p
      className={`text-[10.5px] wide:text-[11px] font-bold leading-tight tabular-nums normal-case whitespace-nowrap ${className}`}
    >
      <MobileVoterCountLineContent proposalId={proposalId} />
    </p>
  );
};

export default MobileVoterCountLine;
