import { X_CLAIM_IDS } from "@components/XClaim/constants";
import BoardHero from "@components/XClaim/parts/BoardHero";
import BoardLayout from "@components/XClaim/parts/BoardLayout";
import { CLAIM_AMOUNT_LABEL } from "lib/xClaim/constants";
import { FC } from "react";

interface AlreadyLinkedBoardProps {
  onConnectOther: () => void;
}

const AlreadyLinkedBoard: FC<AlreadyLinkedBoardProps> = ({ onConnectOther }) => (
  <BoardLayout
    width="result"
    titleSize="regular"
    hero={<BoardHero art="shy" size={140} />}
    title="this x is already taken"
    body={`this x account already claimed its ${CLAIM_AMOUNT_LABEL} on another wallet. each x account can claim once.`}
    note={`if that other wallet is yours, sign in with it to play with your ${CLAIM_AMOUNT_LABEL} there.`}
    primary={{ kind: "close", id: X_CLAIM_IDS.alreadyLinkedGotIt, label: "got it" }}
    secondary={{
      role: "alternative",
      kind: "run",
      id: X_CLAIM_IDS.connectOtherX,
      label: "connect a different x account",
      modalLabel: "use a different x",
      onPress: onConnectOther,
    }}
  />
);

export default AlreadyLinkedBoard;
