import { GETTING_CREDIT_LABEL, KEEP_PAGE_OPEN_NOTE } from "@components/ClaimVote/copy";
import BoardHero from "@components/XClaim/parts/BoardHero";
import BoardLayout from "@components/XClaim/parts/BoardLayout";
import { FC } from "react";

const RunningBoard: FC = () => (
  <BoardLayout
    width="result"
    titleSize="regular"
    spacing="roomier"
    hero={<BoardHero art="building" size={180} />}
    title="on it"
    body={GETTING_CREDIT_LABEL}
    note={KEEP_PAGE_OPEN_NOTE}
  />
);

export default RunningBoard;
