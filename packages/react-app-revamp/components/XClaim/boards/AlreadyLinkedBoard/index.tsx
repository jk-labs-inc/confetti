import type { XClaimJustVote } from "@components/XClaim/board";
import { X_CLAIM_IDS } from "@components/XClaim/constants";
import { justVoteButton } from "@components/XClaim/justVote";
import BoardHero from "@components/XClaim/parts/BoardHero";
import BoardLayout from "@components/XClaim/parts/BoardLayout";
import { CLAIM_AMOUNT_LABEL } from "lib/xClaim/constants";
import { FC } from "react";

interface AlreadyLinkedBoardProps {
  onConnectOther: () => void;
  justVote: XClaimJustVote | null;
}

const AlreadyLinkedBoard: FC<AlreadyLinkedBoardProps> = ({ onConnectOther, justVote }) => (
  <BoardLayout
    width="result"
    titleSize="regular"
    hero={<BoardHero art="shy" size={140} />}
    title="this twitter is linked to another wallet"
    body={`this twitter account is already connected to a different wallet. each twitter account can claim ${CLAIM_AMOUNT_LABEL} with one wallet only.`}
    note={justVote?.note ?? "if that other wallet is yours, sign in with it to check its claim status."}
    primary={
      justVote ? justVoteButton(justVote) : { kind: "close", id: X_CLAIM_IDS.alreadyLinkedGotIt, label: "got it" }
    }
    secondary={{
      role: "alternative",
      kind: "run",
      id: X_CLAIM_IDS.connectOtherX,
      label: "connect a different twitter account",
      modalLabel: "use a different twitter",
      onPress: onConnectOther,
    }}
  />
);

export default AlreadyLinkedBoard;
