import type { XClaimJustVote } from "@components/XClaim/board";
import { X_CLAIM_IDS } from "@components/XClaim/constants";
import { handleText } from "@components/XClaim/copy";
import { justVoteButton } from "@components/XClaim/justVote";
import BoardHero from "@components/XClaim/parts/BoardHero";
import BoardLayout from "@components/XClaim/parts/BoardLayout";
import CheckStickers from "@components/XClaim/parts/CheckStickers";
import type { XAccountStats, XClaimChecks } from "lib/xClaim/types";
import { FC } from "react";

interface NotEligibleBoardProps {
  handle: string | null;
  checks: XClaimChecks;
  stats: XAccountStats | null;
  onAddFunds: () => void;
  justVote: XClaimJustVote | null;
}

const NotEligibleBoard: FC<NotEligibleBoardProps> = ({ handle, checks, stats, onAddFunds, justVote }) => (
  <BoardLayout
    width="result"
    titleSize="regular"
    hero={<BoardHero art="shy" size={140} />}
    title="not quite yet"
    body={`${handleText(handle)} didn't pass every check yet. ${justVote ? "you can still vote with your funds." : "you can still play: add funds with a card in about a minute."}`}
    note={justVote?.note ?? "once you pass, come back with the same twitter account."}
    primary={
      justVote
        ? justVoteButton(justVote)
        : { kind: "run", id: X_CLAIM_IDS.addFunds, label: "add funds", onPress: onAddFunds }
    }
    secondary={{ role: "dismiss", label: "close" }}
  >
    <CheckStickers states={checks} stats={stats} />
  </BoardLayout>
);

export default NotEligibleBoard;
