import { CLAIM_TITLE, VERIFY_TWITTER_LABEL } from "@components/XClaim/copy";
import { X_CLAIM_ART } from "@components/XClaim/constants";
import type { XClaimOpenOffer } from "lib/xClaim/types";
import { ComponentPropsWithRef, FC } from "react";
import XClaimAmountSticker from "../XClaimAmountSticker";

interface XClaimClaimRowProps extends Omit<ComponentPropsWithRef<"button">, "className" | "children"> {
  offer: XClaimOpenOffer;
  placement: "menu" | "drawer";
}

const PLACEMENT = {
  menu: { radius: "rounded-2xl", image: 60 },
  drawer: { radius: "rounded-[20px]", image: 64 },
} as const;

const XClaimClaimRow: FC<XClaimClaimRowProps> = ({ offer, placement, ...buttonProps }) => {
  const { radius, image } = PLACEMENT[placement];
  const { spots, linked } = offer;

  return (
    <button
      type="button"
      {...buttonProps}
      className={`flex w-full items-center gap-2.5 bg-neutral-2 py-1.5 pr-3.5 pl-1 text-left transition-colors hover:bg-neutral-3 data-focus:bg-neutral-3 ${radius}`}
    >
      <img
        src={X_CLAIM_ART.ballot.src}
        alt=""
        width={image}
        height={image}
        className="shrink-0 object-contain"
        style={{ width: image, height: image }}
      />
      <span className="flex flex-1 flex-col gap-1">
        <span className="font-sabo-filled text-[17px] text-neutral-11">{CLAIM_TITLE}</span>
        <span className="text-[13px] text-neutral-9">
          {linked ? "one tap to claim" : VERIFY_TWITTER_LABEL} · {spots.open} of {spots.dailyLimit} spots left today
        </span>
      </span>
      <XClaimAmountSticker className="px-2.5 py-1 text-[13px] -rotate-6" />
    </button>
  );
};

export default XClaimClaimRow;
