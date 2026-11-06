import { CLAIM_VOTE_IDS } from "@components/ClaimVote/constants";
import { CHECK_FAILED_BODY, CHECK_FAILED_TITLE } from "@components/ClaimVote/copy";
import BoardHero from "@components/XClaim/parts/BoardHero";
import BoardLayout from "@components/XClaim/parts/BoardLayout";
import { FC } from "react";

interface CheckFailedBoardProps {
  onRetry: () => void;
}

const CheckFailedBoard: FC<CheckFailedBoardProps> = ({ onRetry }) => (
  <BoardLayout
    width="result"
    titleSize="regular"
    hero={<BoardHero art="shy" size={180} />}
    title={CHECK_FAILED_TITLE}
    body={CHECK_FAILED_BODY}
    primary={{ kind: "run", id: CLAIM_VOTE_IDS.checkRetry, label: "try again", onPress: onRetry }}
    secondary={{ role: "dismiss", label: "close" }}
  />
);

export default CheckFailedBoard;
