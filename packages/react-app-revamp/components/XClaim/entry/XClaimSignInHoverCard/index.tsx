import { CLAIM_TITLE, teaserText } from "@components/XClaim/copy";
import { X_CLAIM_ART } from "@components/XClaim/constants";
import SpotsLine from "@components/XClaim/parts/SpotsLine";
import type { XClaimTeaserOffer } from "lib/xClaim/types";
import { FC } from "react";

interface XClaimSignInHoverCardProps {
  offer: XClaimTeaserOffer;
}

const XClaimSignInHoverCard: FC<XClaimSignInHoverCardProps> = ({ offer }) => (
  <div
    role="tooltip"
    data-x-claim-hover-card
    className="invisible absolute top-[50px] right-0 z-50 flex w-80 items-center gap-2.5 rounded-3xl bg-neutral-2 pt-3.5 pr-4 pb-4 pl-2.5 text-left opacity-0 transition-opacity duration-150 group-hover/signin:visible group-hover/signin:opacity-100 group-has-[:focus-visible]/signin:visible group-has-[:focus-visible]/signin:opacity-100"
  >
    <img
      src={X_CLAIM_ART.money.src}
      alt={X_CLAIM_ART.money.alt}
      width={84}
      height={84}
      className="size-21 shrink-0 object-contain"
    />
    <div className="flex flex-col gap-1.5">
      <p className="font-sabo-filled text-[18px] leading-[1.15] text-neutral-11">{CLAIM_TITLE}</p>
      <p className="text-[14px] leading-[1.45] text-neutral-9">{teaserText(offer)}</p>
      {offer.status === "open" && <SpotsLine spots={offer.spots} placement="card" />}
    </div>
  </div>
);

export default XClaimSignInHoverCard;
