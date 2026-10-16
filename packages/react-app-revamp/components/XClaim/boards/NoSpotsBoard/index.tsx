import { useXClaimBoard, type XClaimSecondarySpec } from "@components/XClaim/board";
import { X_CLAIM_IDS } from "@components/XClaim/constants";
import { CLAIM_BUTTON_LABEL, handleText, releaseTimeText } from "@components/XClaim/copy";
import BoardHero from "@components/XClaim/parts/BoardHero";
import BoardLayout from "@components/XClaim/parts/BoardLayout";
import InfoPill from "@components/XClaim/parts/InfoPill";
import { ROUTE_VIEW_LIVE_CONTESTS } from "@config/routes";
import { CLAIM_AMOUNT_LABEL } from "lib/xClaim/constants";
import type { XClaimNoSpotsCause } from "lib/xClaim/types";
import { FC } from "react";

interface NoSpotsBoardProps {
  handle: string | null;
  cause: XClaimNoSpotsCause;
  canClaimNow: boolean;
  onClaim: () => void;
}

const BROWSE_CONTESTS: XClaimSecondarySpec = {
  role: "alternative",
  kind: "link",
  id: X_CLAIM_IDS.browseContests,
  label: "browse contests meanwhile",
  modalLabel: "browse contests",
  href: ROUTE_VIEW_LIVE_CONTESTS,
};

const NoSpotsBoard: FC<NoSpotsBoardProps> = ({ handle, cause, canClaimNow, onClaim }) => {
  const { layout } = useXClaimBoard();
  const claimPlace = layout === "modal" ? "one click from your account menu" : "one tap from your profile";
  const hero = <BoardHero art="shy" size={140} />;

  if (canClaimNow) {
    return (
      <BoardLayout
        width="result"
        titleSize="regular"
        hero={hero}
        title="a spot just opened"
        body={`${handleText(handle)} is verified. claim your ${CLAIM_AMOUNT_LABEL} now with one tap.`}
        primary={{ kind: "run", id: X_CLAIM_IDS.noSpotsClaim, label: CLAIM_BUTTON_LABEL, onPress: onClaim }}
        secondary={{ role: "dismiss", label: "maybe later" }}
      />
    );
  }

  if (cause.kind === "paused") {
    return (
      <BoardLayout
        width="result"
        titleSize="regular"
        hero={hero}
        title="claims are paused"
        body={`we paused claims for a bit. check back later and claim with ${claimPlace}.`}
        primary={{ kind: "close", id: X_CLAIM_IDS.noSpotsGotIt, label: "got it" }}
        secondary={BROWSE_CONTESTS}
      />
    );
  }

  return (
    <BoardLayout
      width="result"
      titleSize="regular"
      hero={hero}
      title="all spots just got taken"
      body={`${handleText(handle)} is verified, so claiming takes ${claimPlace} when spots open.`}
      primary={{ kind: "close", id: X_CLAIM_IDS.noSpotsGotIt, label: "got it" }}
      secondary={BROWSE_CONTESTS}
    >
      {cause.nextReleaseAt && (
        <InfoPill tone="grey" icon="clock">
          next spots open {releaseTimeText(cause.nextReleaseAt)}
        </InfoPill>
      )}
    </BoardLayout>
  );
};

export default NoSpotsBoard;
