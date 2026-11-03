import { CLAIM_VOTE_IDS } from "@components/ClaimVote/constants";
import {
  FINISH_BUTTON_LABEL,
  FINISH_TITLE,
  finishLineLabel,
  OWN_VOTE_FAILED_TITLE,
  OWN_VOTE_RETRY_LABEL,
  ownVoteBody,
  voteFailureLine,
} from "@components/ClaimVote/copy";
import BoardHero from "@components/XClaim/parts/BoardHero";
import BoardLayout from "@components/XClaim/parts/BoardLayout";
import type { VoteFailure } from "lib/claimVote/types";
import { FC } from "react";

interface FinishVoteBoardProps {
  entryTitle: string;
  failure: VoteFailure;
  isOwnVote: boolean;
  onFinish: (() => void) | null;
}

const FinishVoteBoard: FC<FinishVoteBoardProps> = ({ entryTitle, failure, isOwnVote, onFinish }) => (
  <BoardLayout
    width="result"
    titleSize="regular"
    hero={<BoardHero art="shy" size={180} />}
    title={isOwnVote ? OWN_VOTE_FAILED_TITLE : FINISH_TITLE}
    body={isOwnVote ? ownVoteBody(entryTitle) : finishLineLabel(entryTitle)}
    note={voteFailureLine(failure)}
    primary={
      onFinish
        ? {
            kind: "run",
            id: isOwnVote ? CLAIM_VOTE_IDS.ownVoteRetry : CLAIM_VOTE_IDS.finishVote,
            label: isOwnVote ? OWN_VOTE_RETRY_LABEL : FINISH_BUTTON_LABEL,
            onPress: onFinish,
          }
        : undefined
    }
    secondary={{ role: "dismiss", label: "close" }}
  />
);

export default FinishVoteBoard;
