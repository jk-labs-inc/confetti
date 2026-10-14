import { CLAIM_PLUS_LABEL } from "@components/XClaim/copy";
import { FC } from "react";

interface XClaimAmountStickerProps {
  className: string;
}

const XClaimAmountSticker: FC<XClaimAmountStickerProps> = ({ className }) => (
  <span
    aria-hidden="true"
    className={`pointer-events-none whitespace-nowrap rounded-full bg-primary-10 font-black text-true-black ${className}`}
  >
    {CLAIM_PLUS_LABEL}
  </span>
);

export default XClaimAmountSticker;
