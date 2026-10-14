import { TODO_CHECKS, XClaimBoardContext, type CheckStickerStates, type XClaimLayout } from "@components/XClaim/board";
import AlreadyClaimedBoard from "@components/XClaim/boards/AlreadyClaimedBoard";
import AlreadyLinkedBoard from "@components/XClaim/boards/AlreadyLinkedBoard";
import CheckingBoard from "@components/XClaim/boards/CheckingBoard";
import ClaimExternalWalletBoard from "@components/XClaim/boards/ClaimExternalWalletBoard";
import ClaimOfferBoard from "@components/XClaim/boards/ClaimOfferBoard";
import NoSpotsBoard from "@components/XClaim/boards/NoSpotsBoard";
import NotEligibleBoard from "@components/XClaim/boards/NotEligibleBoard";
import PayoutFailedBoard from "@components/XClaim/boards/PayoutFailedBoard";
import SuccessBoard from "@components/XClaim/boards/SuccessBoard";
import XCancelledBoard from "@components/XClaim/boards/XCancelledBoard";
import { X_CLAIM_IDS } from "@components/XClaim/constants";
import { CLAIM_BUTTON_LABEL, handleText } from "@components/XClaim/copy";
import { CLAIM_AMOUNT_LABEL } from "lib/xClaim/constants";
import type { XClaimActions, XClaimSheetView } from "lib/xClaim/types";
import { FC, ReactElement } from "react";

interface XClaimSheetContentProps {
  view: XClaimSheetView;
  actions: XClaimActions;
  layout: XClaimLayout;
  onAddFunds: () => void;
}

const PASSED_CHECKS: CheckStickerStates = { verified: "passed", verifiedFollowers: "passed", ratio: "passed" };

const boardFor = (view: XClaimSheetView, actions: XClaimActions, onAddFunds: () => void): ReactElement => {
  switch (view.board) {
    case "ClaimStart":
      return (
        <ClaimOfferBoard
          bubble="on_us"
          body={`connect your x. pass three quick checks and the ${CLAIM_AMOUNT_LABEL} pops right into your wallet.`}
          primary={{
            kind: "run",
            id: X_CLAIM_IDS.connectX,
            label: "connect x",
            onPress: () => actions.startXClaim(),
            withXLogo: true,
          }}
          checks={TODO_CHECKS}
          spots={view.spots}
        />
      );
    case "ClaimConfirmX":
      return (
        <ClaimOfferBoard
          bubble="one_more_tap"
          body="you signed in with x. confirm it once more so bubbles can run three quick checks."
          primary={{
            kind: "run",
            id: X_CLAIM_IDS.confirmX,
            label: "confirm x account",
            onPress: () => actions.startXClaim(),
            withXLogo: true,
          }}
          checks={TODO_CHECKS}
          spots={view.spots}
        />
      );
    case "ClaimExternalWallet":
      return (
        <ClaimExternalWalletBoard
          wallet={view.wallet}
          activeStep={view.activeStep}
          spots={view.spots}
          onSign={() => actions.startXClaim()}
        />
      );
    case "ClaimLinked":
      return (
        <ClaimOfferBoard
          bubble="on_us"
          body={`${handleText(view.handle)} already passed all three checks. one tap and the ${CLAIM_AMOUNT_LABEL} pops right into your wallet.`}
          primary={{
            kind: "run",
            id: X_CLAIM_IDS.linkedClaim,
            label: CLAIM_BUTTON_LABEL,
            onPress: () => actions.retryClaim(),
          }}
          checks={PASSED_CHECKS}
          spots={view.spots}
        />
      );
    case "Checking":
      return <CheckingBoard handle={view.handle} />;
    case "Success":
      return (
        <SuccessBoard payout={view.payout} confirming={view.confirming} onCheckAgain={() => actions.checkStatus()} />
      );
    case "NotEligible":
      return <NotEligibleBoard handle={view.handle} checks={view.checks} stats={view.stats} onAddFunds={onAddFunds} />;
    case "AlreadyLinked":
      return <AlreadyLinkedBoard onConnectOther={() => actions.startXClaim()} />;
    case "AlreadyClaimed":
      return <AlreadyClaimedBoard handle={view.handle} claimedAt={view.claimedAt} />;
    case "NoSpots":
      return (
        <NoSpotsBoard
          handle={view.handle}
          cause={view.cause}
          canClaimNow={view.canClaimNow}
          onClaim={() => actions.retryClaim()}
        />
      );
    case "PayoutFailed":
      return <PayoutFailedBoard handle={view.handle} onRetry={() => actions.retryClaim()} />;
    case "XCancelled":
      return <XCancelledBoard reason={view.reason} spots={view.spots} onRetry={() => actions.startXClaim()} />;
  }
};

const XClaimSheetContent: FC<XClaimSheetContentProps> = ({ view, actions, layout, onAddFunds }) => (
  <XClaimBoardContext.Provider value={{ board: view.board, layout, action: view.action, close: actions.close }}>
    {boardFor(view, actions, onAddFunds)}
  </XClaimBoardContext.Provider>
);

export default XClaimSheetContent;
