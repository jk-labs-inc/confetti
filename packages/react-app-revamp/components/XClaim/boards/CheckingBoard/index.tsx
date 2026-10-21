import type { CheckStickerStates } from "@components/XClaim/board";
import { handleText } from "@components/XClaim/copy";
import BoardHero from "@components/XClaim/parts/BoardHero";
import BoardLayout from "@components/XClaim/parts/BoardLayout";
import CheckStickers from "@components/XClaim/parts/CheckStickers";
import { FC } from "react";

interface CheckingBoardProps {
  handle: string | null;
}

const CHECKING_CHECKS: CheckStickerStates = { verified: "passed", verifiedFollowers: "running", ratio: "queued" };

const CheckingBoard: FC<CheckingBoardProps> = ({ handle }) => (
  <BoardLayout
    width="result"
    titleSize="regular"
    spacing="roomier"
    hero={<BoardHero art="building" size={180} />}
    title={`checking ${handleText(handle)}`}
    body="bubbles is double-checking your profile. a few seconds."
  >
    <CheckStickers states={CHECKING_CHECKS} />
  </BoardLayout>
);

export default CheckingBoard;
