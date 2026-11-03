import type { XClaimJustVote } from "@components/XClaim/board";
import { X_CLAIM_IDS } from "@components/XClaim/constants";
import { savedForText } from "@components/XClaim/copy";
import { justVoteSecondary, labelWithTotal } from "@components/XClaim/justVote";
import BoardHero from "@components/XClaim/parts/BoardHero";
import BoardLayout from "@components/XClaim/parts/BoardLayout";
import InfoPill from "@components/XClaim/parts/InfoPill";
import { LINK_TELEGRAM } from "@config/links";
import { CLAIM_AMOUNT_LABEL } from "lib/xClaim/constants";
import { FC } from "react";

interface PayoutFailedBoardProps {
  handle: string | null;
  onRetry: () => void;
  justVote: XClaimJustVote | null;
}

const PayoutFailedBoard: FC<PayoutFailedBoardProps> = ({ handle, onRetry, justVote }) => (
  <BoardLayout
    width="result"
    titleSize="regular"
    hero={<BoardHero art="building" size={160} />}
    title="we couldn't send it yet"
    body={`the network was busy. your ${CLAIM_AMOUNT_LABEL} is saved, so nothing is lost. try again in a moment.`}
    note={justVote?.note}
    primary={{
      kind: "run",
      id: X_CLAIM_IDS.payoutRetry,
      label: labelWithTotal("try again", justVote),
      onPress: onRetry,
    }}
    secondary={justVote ? justVoteSecondary(justVote) : { role: "dismiss", label: "close" }}
    footer={
      <>
        still stuck?{" "}
        <a
          id={X_CLAIM_IDS.contactUs}
          href={LINK_TELEGRAM}
          target="_blank"
          rel="noreferrer"
          className="font-bold text-secondary-11 hover:underline"
        >
          contact us
        </a>
      </>
    }
  >
    <InfoPill tone="yellow" amount={CLAIM_AMOUNT_LABEL}>
      {savedForText(handle)}
    </InfoPill>
  </BoardLayout>
);

export default PayoutFailedBoard;
