import { CLAIM_TITLE, teaserText } from "@components/XClaim/copy";
import { X_CLAIM_ART, X_CLAIM_IDS } from "@components/XClaim/constants";
import SpotsLine from "@components/XClaim/parts/SpotsLine";
import { signedOutTeaserFor } from "lib/xClaim/view";
import type { XClaimOffer } from "lib/xClaim/types";
import { FC } from "react";
import { useTipDismissal } from "./useTipDismissal";

interface XClaimNavTipProps {
  claimOffer: XClaimOffer;
}

const XClaimNavTip: FC<XClaimNavTipProps> = ({ claimOffer }) => {
  const { isDismissed, dismiss } = useTipDismissal();
  const offer = signedOutTeaserFor(claimOffer);
  if (!offer || isDismissed) return null;

  return (
    <div
      data-x-claim-tip
      className="absolute inset-x-4 bottom-[calc(100%+16px)] ml-auto hidden max-w-[358px] items-center gap-2 rounded-3xl bg-neutral-2 py-2.5 pr-2.5 pl-1.5 text-left peer-empty:flex"
    >
      <img
        src={X_CLAIM_ART.money.src}
        alt={X_CLAIM_ART.money.alt}
        width={76}
        height={76}
        className="size-19 shrink-0 object-contain"
      />
      <div className="flex flex-1 flex-col gap-[5px]">
        <p className="font-sabo-filled text-[17px] leading-[1.15] text-neutral-11">{CLAIM_TITLE}</p>
        <p className="text-[14px] leading-[1.4] text-neutral-9">{teaserText(offer)}</p>
        {offer.status === "open" && <SpotsLine spots={offer.spots} placement="card" />}
      </div>
      <button
        id={X_CLAIM_IDS.tipDismiss}
        type="button"
        aria-label="dismiss"
        onClick={dismiss}
        className="flex size-9 shrink-0 items-center justify-center self-start rounded-full"
      >
        <img src="/modal/modal_close.svg" alt="" width={18} height={17} />
      </button>
      <span aria-hidden="true" className="absolute -bottom-1.5 right-10 size-3 rotate-45 bg-neutral-2" />
    </div>
  );
};

export default XClaimNavTip;
