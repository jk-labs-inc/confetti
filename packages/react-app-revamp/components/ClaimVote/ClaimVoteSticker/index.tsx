import { CLAIM_PLUS_LABEL } from "@components/XClaim/copy";
import { FC } from "react";

interface ClaimVoteStickerProps {
  className: string;
  label?: string;
}

const ClaimVoteSticker: FC<ClaimVoteStickerProps> = ({ className, label = CLAIM_PLUS_LABEL }) => (
  <span
    aria-hidden="true"
    className={`pointer-events-none whitespace-nowrap rounded-full bg-primary-10 font-black text-true-black ${className}`}
  >
    {label}
  </span>
);

export default ClaimVoteSticker;
