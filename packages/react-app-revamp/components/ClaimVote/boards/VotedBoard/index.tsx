import { CLAIM_VOTE_IDS } from "@components/ClaimVote/constants";
import { VOTED_TITLE, votedBody, votesCastText } from "@components/ClaimVote/copy";
import BoardHero from "@components/XClaim/parts/BoardHero";
import BoardLayout from "@components/XClaim/parts/BoardLayout";
import type { CastVotesResult } from "@hooks/useCastVotes/types";
import { FC } from "react";

interface VotedBoardProps {
  entryTitle: string;
  result: CastVotesResult | null;
}

const VotedBoard: FC<VotedBoardProps> = ({ entryTitle, result }) => (
  <BoardLayout
    width="result"
    titleSize="large"
    spacing="roomy"
    hero={<BoardHero art="money" size={220} coin />}
    title={VOTED_TITLE}
    body={votedBody(entryTitle)}
    primary={{ kind: "close", id: CLAIM_VOTE_IDS.votedDone, label: "done" }}
  >
    {result && (
      <p id={result.successMeta.id} {...result.successMeta.dataAttributes} className="text-[16px] font-bold">
        {votesCastText(result.amountOfVotes)}
      </p>
    )}
  </BoardLayout>
);

export default VotedBoard;
