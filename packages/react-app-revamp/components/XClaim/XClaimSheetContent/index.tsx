import {
  TODO_CHECKS,
  XClaimBoardContext,
  type CheckStickerStates,
  type XClaimJustVote,
  type XClaimLayout,
} from "@components/XClaim/board";
import AlreadyClaimedBoard from "@components/XClaim/boards/AlreadyClaimedBoard";
import AlreadyLinkedBoard from "@components/XClaim/boards/AlreadyLinkedBoard";
import CheckingBoard from "@components/XClaim/boards/CheckingBoard";
import ClaimOfferBoard from "@components/XClaim/boards/ClaimOfferBoard";
import NoSpotsBoard from "@components/XClaim/boards/NoSpotsBoard";
import NotEligibleBoard from "@components/XClaim/boards/NotEligibleBoard";
import PayoutFailedBoard from "@components/XClaim/boards/PayoutFailedBoard";
import SuccessBoard from "@components/XClaim/boards/SuccessBoard";
import XCancelledBoard from "@components/XClaim/boards/XCancelledBoard";
import { X_CLAIM_IDS } from "@components/XClaim/constants";
import { justVoteSecondary, labelWithTotal } from "@components/XClaim/justVote";
import { CLAIM_BUTTON_LABEL, CLAIM_PITCH, handleText, VERIFY_TWITTER_LABEL } from "@components/XClaim/copy";
import { CLAIM_AMOUNT_LABEL } from "lib/xClaim/constants";
import type { XClaimActions, XClaimSheetView } from "lib/xClaim/types";
import { FC, ReactElement } from "react";

interface XClaimSheetContentProps {
  view: XClaimSheetView;
  actions: XClaimActions;
  layout: XClaimLayout;
  onAddFunds: () => void;
  justVote: XClaimJustVote | null;
}

const PASSED_CHECKS: CheckStickerStates = { verified: "passed", verifiedFollowers: "passed", ratio: "passed" };

const justVoteOfferProps = (justVote: XClaimJustVote | null) =>
  justVote ? { secondary: justVoteSecondary(justVote), note: justVote.note } : {};

const boardFor = (
  view: XClaimSheetView,
  actions: XClaimActions,
  onAddFunds: () => void,
  justVote: XClaimJustVote | null,
): ReactElement => {
  switch (view.board) {
    case "ClaimSignedOut":
      return (
        <ClaimOfferBoard
          bubble="on_us"
          body={CLAIM_PITCH}
          primary={{ kind: "run", id: X_CLAIM_IDS.createWallet, label: "create account", onPress: actions.signIn }}
          secondary={{
            role: "alternative",
            kind: "run",
            id: X_CLAIM_IDS.signInExisting,
            label: "i already have an account",
            modalLabel: "sign in",
            onPress: actions.signIn,
          }}
          checks={TODO_CHECKS}
          spots={view.spots}
        />
      );
    case "ClaimStart":
      return (
        <ClaimOfferBoard
          bubble="on_us"
          body={`verify your twitter and we'll put ${CLAIM_AMOUNT_LABEL} into your vote.`}
          primary={{
            kind: "run",
            id: X_CLAIM_IDS.connectX,
            label: labelWithTotal(VERIFY_TWITTER_LABEL, justVote),
            onPress: () => actions.startXClaim(),
            withXLogo: true,
          }}
          {...justVoteOfferProps(justVote)}
          checks={TODO_CHECKS}
          spots={view.spots}
        />
      );
    case "ClaimConfirmX":
      return (
        <ClaimOfferBoard
          bubble="one_more_tap"
          body={`you signed in with twitter. confirm it once more and we'll put ${CLAIM_AMOUNT_LABEL} into your vote.`}
          primary={{
            kind: "run",
            id: X_CLAIM_IDS.confirmX,
            label: labelWithTotal("confirm twitter", justVote),
            onPress: () => actions.startXClaim(),
            withXLogo: true,
          }}
          {...justVoteOfferProps(justVote)}
          checks={TODO_CHECKS}
          spots={view.spots}
        />
      );
    case "ClaimLinked":
      return (
        <ClaimOfferBoard
          bubble="on_us"
          body={`${handleText(view.handle)} is already verified. one tap and the ${CLAIM_AMOUNT_LABEL} goes into your vote.`}
          primary={{
            kind: "run",
            id: X_CLAIM_IDS.linkedClaim,
            label: labelWithTotal(CLAIM_BUTTON_LABEL, justVote),
            onPress: () => actions.retryClaim(),
          }}
          {...justVoteOfferProps(justVote)}
          checks={PASSED_CHECKS}
          spots={view.spots}
        />
      );
    case "Checking":
      return <CheckingBoard handle={view.handle} />;
    case "Success":
      return (
        <SuccessBoard
          confirming={view.confirming}
          onContest={view.onContest}
          onCheckAgain={() => actions.checkStatus()}
        />
      );
    case "NotEligible":
      return (
        <NotEligibleBoard
          handle={view.handle}
          checks={view.checks}
          stats={view.stats}
          onAddFunds={onAddFunds}
          justVote={justVote}
        />
      );
    case "AlreadyLinked":
      return <AlreadyLinkedBoard onConnectOther={() => actions.startXClaim()} justVote={justVote} />;
    case "AlreadyClaimed":
      return <AlreadyClaimedBoard handle={view.handle} claimedAt={view.claimedAt} onContest={view.onContest} />;
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
      return (
        <XCancelledBoard
          reason={view.reason}
          spots={view.spots}
          onRetry={() => actions.startXClaim()}
          justVote={justVote}
        />
      );
  }
};

const XClaimSheetContent: FC<XClaimSheetContentProps> = ({ view, actions, layout, onAddFunds, justVote }) => (
  <XClaimBoardContext.Provider
    value={{ board: view.board, layout, action: view.action, settling: view.settling, close: actions.close }}
  >
    {boardFor(view, actions, onAddFunds, justVote)}
  </XClaimBoardContext.Provider>
);

export default XClaimSheetContent;
