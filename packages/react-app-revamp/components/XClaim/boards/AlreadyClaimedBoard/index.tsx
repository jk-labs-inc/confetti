import { X_CLAIM_IDS } from "@components/XClaim/constants";
import { claimedPillText } from "@components/XClaim/copy";
import BoardHero from "@components/XClaim/parts/BoardHero";
import BoardLayout from "@components/XClaim/parts/BoardLayout";
import InfoPill from "@components/XClaim/parts/InfoPill";
import { ROUTE_VIEW_LIVE_CONTESTS } from "@config/routes";
import { CLAIM_AMOUNT_LABEL } from "lib/xClaim/constants";
import { FC } from "react";

interface AlreadyClaimedBoardProps {
  handle: string | null;
  claimedAt: Date | null;
}

const AlreadyClaimedBoard: FC<AlreadyClaimedBoardProps> = ({ handle, claimedAt }) => (
  <BoardLayout
    width="result"
    titleSize="regular"
    hero={<BoardHero art="money" size={176} modalSize={180} />}
    title="you already claimed"
    body={`each wallet gets ${CLAIM_AMOUNT_LABEL} once. go put it to work.`}
    primary={{
      kind: "link",
      id: X_CLAIM_IDS.alreadyClaimedFindContest,
      label: "find a contest to vote in",
      href: ROUTE_VIEW_LIVE_CONTESTS,
    }}
    secondary={{ role: "dismiss", label: "close" }}
  >
    <InfoPill tone="yellow" amount={CLAIM_AMOUNT_LABEL}>
      {claimedPillText({ handle, claimedAt })}
    </InfoPill>
  </BoardLayout>
);

export default AlreadyClaimedBoard;
