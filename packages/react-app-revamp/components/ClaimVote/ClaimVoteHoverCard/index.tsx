import { creditLine } from "@components/ClaimVote/copy";
import { X_CLAIM_ART } from "@components/XClaim/constants";
import { CLAIM_TITLE } from "@components/XClaim/copy";
import SpotsLine from "@components/XClaim/parts/SpotsLine";
import type { XClaimOpenOffer } from "lib/xClaim/types";
import { FC } from "react";

interface ClaimVoteHoverCardProps {
  offer: XClaimOpenOffer;
}

const ClaimVoteHoverCard: FC<ClaimVoteHoverCardProps> = ({ offer }) => (
  <div
    role="tooltip"
    data-claim-vote-hover-card
    className="invisible absolute inset-x-0 bottom-full z-50 mb-4 flex items-center gap-2.5 rounded-3xl bg-neutral-3 pt-3.5 pr-4 pb-4 pl-2.5 text-left opacity-0 transition-opacity duration-150 group-hover/vote:visible group-hover/vote:opacity-100 group-has-[:focus-visible]/vote:visible group-has-[:focus-visible]/vote:opacity-100"
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
      <p className="text-[14px] leading-[1.45] text-neutral-9">{creditLine(offer)}</p>
      <SpotsLine spots={offer.spots} placement="card" />
    </div>
  </div>
);

export default ClaimVoteHoverCard;
