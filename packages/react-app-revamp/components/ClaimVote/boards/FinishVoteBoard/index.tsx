import { CLAIM_VOTE_IDS } from "@components/ClaimVote/constants";
import { FINISH_BUTTON_LABEL, FINISH_TITLE, finishLineLabel, voteFailureLine } from "@components/ClaimVote/copy";
import BoardHero from "@components/XClaim/parts/BoardHero";
import BoardLayout from "@components/XClaim/parts/BoardLayout";
import type { VoteFailure } from "lib/claimVote/types";
import { FC } from "react";

interface FinishVoteBoardProps {
  entryTitle: string;
  failure: VoteFailure;
  onFinish: (() => void) | null;
}

const FinishVoteBoard: FC<FinishVoteBoardProps> = ({ entryTitle, failure, onFinish }) => (
  <BoardLayout
    width="result"
    titleSize="regular"
    hero={<BoardHero art="shy" size={180} />}
    title={FINISH_TITLE}
    body={finishLineLabel(entryTitle)}
    note={voteFailureLine(failure)}
    primary={
      onFinish
        ? { kind: "run", id: CLAIM_VOTE_IDS.finishVote, label: FINISH_BUTTON_LABEL, onPress: onFinish }
        : undefined
    }
    secondary={{ role: "dismiss", label: "close" }}
  />
);

export default FinishVoteBoard;
