import { creditLine } from "@components/ClaimVote/copy";
import type { ClaimVoteLine as ClaimVoteLineState } from "lib/claimVote/types";
import { FC } from "react";

interface ClaimVoteLineProps {
  line: ClaimVoteLineState;
}

const ClaimVoteLine: FC<ClaimVoteLineProps> = ({ line }) =>
  line.kind === "offer" ? (
    <p className="text-center text-[14px] text-neutral-9 [@media(hover:hover)]:hidden">{creditLine(line.offer)}</p>
  ) : null;

export default ClaimVoteLine;
