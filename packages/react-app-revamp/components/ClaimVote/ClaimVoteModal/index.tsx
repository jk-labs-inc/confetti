import CheckFailedBoard from "@components/ClaimVote/boards/CheckFailedBoard";
import ExternalWalletBoard from "@components/ClaimVote/boards/ExternalWalletBoard";
import FinishVoteBoard from "@components/ClaimVote/boards/FinishVoteBoard";
import PayoutSlowBoard from "@components/ClaimVote/boards/PayoutSlowBoard";
import RunningBoard from "@components/ClaimVote/boards/RunningBoard";
import VotedBoard from "@components/ClaimVote/boards/VotedBoard";
import { CLAIM_VOTE_BOARD_IDS } from "@components/ClaimVote/constants";
import { XClaimBoardContext, type XClaimLayout } from "@components/XClaim/board";
import XClaimAddFunds from "@components/XClaim/XClaimAddFunds";
import XClaimSheetContent from "@components/XClaim/XClaimSheetContent";
import XClaimSheetFrame from "@components/XClaim/XClaimSheetFrame";
import type { ClaimVoteBoard, ClaimVoteModalView } from "lib/claimVote/types";
import type { XClaimActions } from "lib/xClaim/types";
import { FC, ReactElement, useState } from "react";

type RunView = Exclude<ClaimVoteModalView, { kind: "claim_board" }>;

interface ClaimVoteModalProps {
  isOpen: boolean;
  view: ClaimVoteModalView | null;
  actions: XClaimActions;
  onFinish: (() => void) | null;
  onRetryCheck: () => void;
}

const BOARD_FOR: Readonly<Record<RunView["kind"], ClaimVoteBoard>> = {
  running: "VoteRunning",
  voted: "VoteDone",
  finish: "VoteFinish",
  payout_slow: "PayoutSlow",
  check_failed: "CheckFailed",
  external_info: "ExternalWalletInfo",
};

const IDLE_ACTION = { stage: "idle", error: null } as const;

const runBoard = (view: RunView, onFinish: (() => void) | null, onRetryCheck: () => void): ReactElement => {
  switch (view.kind) {
    case "running":
      return <RunningBoard />;
    case "voted":
      return <VotedBoard entryTitle={view.entryTitle} result={view.result} />;
    case "finish":
      return <FinishVoteBoard entryTitle={view.entryTitle} failure={view.failure} onFinish={onFinish} />;
    case "payout_slow":
      return <PayoutSlowBoard entryTitle={view.entryTitle} />;
    case "check_failed":
      return <CheckFailedBoard onRetry={onRetryCheck} />;
    case "external_info":
      return <ExternalWalletBoard />;
  }
};

const ClaimVoteModal: FC<ClaimVoteModalProps> = ({ isOpen, view, actions, onFinish, onRetryCheck }) => {
  const [addFundsRequest, setAddFundsRequest] = useState(0);

  const addFunds = () => {
    actions.close();
    setAddFundsRequest(count => count + 1);
  };

  const content = (current: ClaimVoteModalView | null, layout: XClaimLayout) => {
    if (!current) return null;
    if (current.kind === "claim_board") {
      return <XClaimSheetContent view={current.view} actions={actions} layout={layout} onAddFunds={addFunds} />;
    }
    const board = BOARD_FOR[current.kind];
    return (
      <XClaimBoardContext.Provider
        value={{ board, layout, action: IDLE_ACTION, settling: false, close: actions.close }}
      >
        <div id={CLAIM_VOTE_BOARD_IDS[board]}>{runBoard(current, onFinish, onRetryCheck)}</div>
      </XClaimBoardContext.Provider>
    );
  };

  return (
    <>
      <XClaimSheetFrame isOpen={isOpen && view !== null} value={view} onClose={actions.close}>
        {content}
      </XClaimSheetFrame>
      {addFundsRequest > 0 && <XClaimAddFunds request={addFundsRequest} />}
    </>
  );
};

export default ClaimVoteModal;
