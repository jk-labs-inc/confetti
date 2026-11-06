import { CLAIM_VOTE_IDS } from "@components/ClaimVote/constants";
import { PAYOUT_SLOW_TITLE, payoutSlowBody } from "@components/ClaimVote/copy";
import BoardHero from "@components/XClaim/parts/BoardHero";
import BoardLayout from "@components/XClaim/parts/BoardLayout";
import { FC } from "react";

interface PayoutSlowBoardProps {
  entryTitle: string;
}

const PayoutSlowBoard: FC<PayoutSlowBoardProps> = ({ entryTitle }) => (
  <BoardLayout
    width="result"
    titleSize="regular"
    hero={<BoardHero art="building" size={180} />}
    title={PAYOUT_SLOW_TITLE}
    body={payoutSlowBody(entryTitle)}
    primary={{ kind: "close", id: CLAIM_VOTE_IDS.payoutSlowGotIt, label: "got it" }}
  />
);

export default PayoutSlowBoard;
