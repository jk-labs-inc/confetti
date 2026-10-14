import type { CheckStickerStates, XClaimButtonSpec } from "@components/XClaim/board";
import { CLAIM_FINE_PRINT, CLAIM_TITLE } from "@components/XClaim/copy";
import BoardHero, { type BoardHeroBubble } from "@components/XClaim/parts/BoardHero";
import BoardLayout from "@components/XClaim/parts/BoardLayout";
import CheckStickers from "@components/XClaim/parts/CheckStickers";
import SpotsLine from "@components/XClaim/parts/SpotsLine";
import type { XClaimSpots } from "lib/xClaim/types";
import { FC } from "react";

interface ClaimOfferBoardProps {
  bubble: BoardHeroBubble;
  body: string;
  primary: XClaimButtonSpec;
  checks: CheckStickerStates;
  spots: XClaimSpots | null;
}

const ClaimOfferBoard: FC<ClaimOfferBoardProps> = ({ bubble, body, primary, checks, spots }) => (
  <BoardLayout
    width="claim"
    titleSize="large"
    hero={<BoardHero art="ballot" size={196} modalSize={176} bubble={bubble} />}
    title={CLAIM_TITLE}
    body={body}
    primary={primary}
    secondary={{ role: "dismiss", label: "maybe later" }}
    finePrint={CLAIM_FINE_PRINT}
  >
    <CheckStickers states={checks} />
    <SpotsLine spots={spots} />
  </BoardLayout>
);

export default ClaimOfferBoard;
