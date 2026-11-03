import { CLAIM_VOTE_IDS } from "@components/ClaimVote/constants";
import {
  OWN_VOTE_SHORT_NOTE,
  OWN_VOTE_TITLE,
  ownVoteBody,
  VOTED_ADD_FUNDS_NOTE,
  VOTED_TITLE,
  votedBody,
  votesCastText,
} from "@components/ClaimVote/copy";
import BoardHero from "@components/XClaim/parts/BoardHero";
import BoardLayout from "@components/XClaim/parts/BoardLayout";
import type { CastVotesResult } from "@hooks/useCastVotes/types";
import { FC } from "react";

interface VotedBoardProps {
  entryTitle: string;
  result: CastVotesResult | null;
  wantedMore: boolean;
  isOwnVote: boolean;
  onAddFunds: () => void;
}

const DONE_BUTTON = { kind: "close", id: CLAIM_VOTE_IDS.votedDone, label: "done" } as const;

const VotedBoard: FC<VotedBoardProps> = ({ entryTitle, result, wantedMore, isOwnVote, onAddFunds }) => (
  <BoardLayout
    width="result"
    titleSize="large"
    spacing="roomy"
    hero={isOwnVote ? <BoardHero art="ballot" size={180} /> : <BoardHero art="money" size={220} coin />}
    title={isOwnVote ? OWN_VOTE_TITLE : VOTED_TITLE}
    body={isOwnVote ? ownVoteBody(entryTitle) : votedBody(entryTitle)}
    note={wantedMore ? (isOwnVote ? OWN_VOTE_SHORT_NOTE : VOTED_ADD_FUNDS_NOTE) : undefined}
    primary={
      wantedMore
        ? { kind: "run", id: CLAIM_VOTE_IDS.votedAddFunds, label: "add funds", onPress: onAddFunds }
        : DONE_BUTTON
    }
    secondary={wantedMore ? { role: "alternative", ...DONE_BUTTON } : undefined}
  >
    {result && (
      <p id={result.successMeta.id} {...result.successMeta.dataAttributes} className="text-[16px] font-bold">
        {votesCastText(result.amountOfVotes)}
      </p>
    )}
  </BoardLayout>
);

export default VotedBoard;
