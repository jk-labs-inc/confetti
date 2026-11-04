import { CLAIM_VOTE_IDS } from "@components/ClaimVote/constants";
import { EXTERNAL_WALLET_LINE } from "@components/ClaimVote/copy";
import BoardHero from "@components/XClaim/parts/BoardHero";
import BoardLayout from "@components/XClaim/parts/BoardLayout";
import { CLAIM_AMOUNT_LABEL } from "lib/xClaim/constants";
import { FC } from "react";

const ExternalWalletBoard: FC = () => (
  <BoardLayout
    width="result"
    titleSize="regular"
    hero={<BoardHero art="ballot" size={180} />}
    title={`${CLAIM_AMOUNT_LABEL} on us`}
    body={EXTERNAL_WALLET_LINE}
    primary={{ kind: "close", id: CLAIM_VOTE_IDS.externalGotIt, label: "got it" }}
  />
);

export default ExternalWalletBoard;
