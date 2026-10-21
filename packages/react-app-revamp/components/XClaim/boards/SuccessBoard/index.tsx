import type { XClaimButtonSpec } from "@components/XClaim/board";
import { X_CLAIM_IDS } from "@components/XClaim/constants";
import BoardButton from "@components/XClaim/parts/BoardButton";
import BoardHero from "@components/XClaim/parts/BoardHero";
import BoardLayout from "@components/XClaim/parts/BoardLayout";
import { ROUTE_VIEW_LIVE_CONTESTS } from "@config/routes";
import { CLAIM_AMOUNT_LABEL } from "lib/xClaim/constants";
import { FC } from "react";

interface SuccessBoardProps {
  confirming: boolean;
  onContest: boolean;
  onCheckAgain: () => void;
}

const BACK_TO_CONTEST: XClaimButtonSpec = {
  kind: "close",
  id: X_CLAIM_IDS.successBackToContest,
  label: "back to contest",
};

const FIND_A_CONTEST: XClaimButtonSpec = {
  kind: "link",
  id: X_CLAIM_IDS.successFindContest,
  label: "find a contest",
  href: ROUTE_VIEW_LIVE_CONTESTS,
};

const BACKING_LINE = "start earning by backing entries you love.";

const SuccessBoard: FC<SuccessBoardProps> = ({ confirming, onContest, onCheckAgain }) => (
  <BoardLayout
    width="result"
    titleSize="large"
    spacing="roomy"
    hero={<BoardHero art="money" size={220} coin />}
    title={confirming ? `boom. ${CLAIM_AMOUNT_LABEL} is on its way` : `boom. ${CLAIM_AMOUNT_LABEL} is yours`}
    body={
      confirming
        ? `it's heading to your wallet and usually lands in a few seconds. ${BACKING_LINE}`
        : `it's in your wallet. ${BACKING_LINE}`
    }
    primary={onContest ? BACK_TO_CONTEST : FIND_A_CONTEST}
    secondary={onContest ? undefined : { role: "dismiss", label: "done" }}
    footer={
      confirming && (
        <BoardButton
          spec={{ kind: "run", id: X_CLAIM_IDS.checkAgain, label: "check again", onPress: onCheckAgain }}
          tone="link"
        />
      )
    }
  />
);

export default SuccessBoard;
