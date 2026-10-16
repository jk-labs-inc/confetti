import { X_CLAIM_IDS } from "@components/XClaim/constants";
import { CANCELLED_BODY } from "@components/XClaim/copy";
import BoardHero from "@components/XClaim/parts/BoardHero";
import BoardLayout from "@components/XClaim/parts/BoardLayout";
import SpotsLine from "@components/XClaim/parts/SpotsLine";
import type { XCancelledReason, XClaimSpots } from "lib/xClaim/types";
import { FC } from "react";

interface XCancelledBoardProps {
  reason: XCancelledReason;
  spots: XClaimSpots | null;
  onRetry: () => void;
}

const XCancelledBoard: FC<XCancelledBoardProps> = ({ reason, spots, onRetry }) => (
  <BoardLayout
    width="result"
    titleSize="regular"
    hero={<BoardHero art="shy" size={140} />}
    title="twitter wasn't connected"
    body={CANCELLED_BODY[reason]}
    primary={{ kind: "run", id: X_CLAIM_IDS.tryXAgain, label: "try again", onPress: onRetry, withXLogo: true }}
    secondary={{ role: "dismiss", label: "maybe later" }}
  >
    <SpotsLine spots={spots} />
  </BoardLayout>
);

export default XCancelledBoard;
