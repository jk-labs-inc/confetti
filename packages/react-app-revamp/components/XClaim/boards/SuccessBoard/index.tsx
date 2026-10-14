import { X_CLAIM_IDS } from "@components/XClaim/constants";
import BoardButton from "@components/XClaim/parts/BoardButton";
import BoardHero from "@components/XClaim/parts/BoardHero";
import BoardLayout from "@components/XClaim/parts/BoardLayout";
import { ROUTE_VIEW_LIVE_CONTESTS } from "@config/routes";
import { CLAIM_AMOUNT_LABEL, POLYGON_CURRENCY, POLYGON_NETWORK } from "lib/xClaim/constants";
import type { XClaimPayout } from "lib/xClaim/types";
import { FC } from "react";

interface SuccessBoardProps {
  payout: XClaimPayout;
  confirming: boolean;
  onCheckAgain: () => void;
}

const SuccessBoard: FC<SuccessBoardProps> = ({ payout, confirming, onCheckAgain }) => {
  const currency = <span className="normal-case">{payout.currency ?? POLYGON_CURRENCY}</span>;
  const network = payout.network ?? POLYGON_NETWORK;
  const explorerLink = payout.explorerUrl && (
    <a
      id={X_CLAIM_IDS.viewTx}
      href={payout.explorerUrl}
      target="_blank"
      rel="noreferrer"
      className="font-bold text-secondary-11 hover:underline"
    >
      {confirming ? "track it on polygonscan" : "see it on polygonscan"}
    </a>
  );
  const checkAgain = confirming && (
    <BoardButton
      spec={{ kind: "run", id: X_CLAIM_IDS.checkAgain, label: "check again", onPress: onCheckAgain }}
      tone="link"
    />
  );

  return (
    <BoardLayout
      width="result"
      titleSize="large"
      spacing="roomy"
      hero={<BoardHero art="money" size={220} coin />}
      title={confirming ? `boom. ${CLAIM_AMOUNT_LABEL} is on its way` : `boom. ${CLAIM_AMOUNT_LABEL} is yours`}
      body={
        confirming ? (
          <>
            it&apos;s heading to your wallet as {currency} on {network} and usually lands in a few seconds. go back an
            entry you love.
          </>
        ) : (
          <>
            it&apos;s in your wallet as {currency} on {network}. go back an entry you love.
          </>
        )
      }
      primary={{
        kind: "link",
        id: X_CLAIM_IDS.successFindContest,
        label: "find a contest to vote in",
        href: ROUTE_VIEW_LIVE_CONTESTS,
      }}
      secondary={{ role: "dismiss", label: "done" }}
      footer={
        (explorerLink || checkAgain) && (
          <>
            {explorerLink}
            {explorerLink && checkAgain && " · "}
            {checkAgain}
          </>
        )
      }
    />
  );
};

export default SuccessBoard;
