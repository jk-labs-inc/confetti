import { CLAIM_VOTE_IDS } from "@components/ClaimVote/constants";
import { DONT_SHOW_AGAIN_LABEL } from "@components/ClaimVote/copy";
import { FC } from "react";

interface HideOfferLinkProps {
  onHide: () => void;
}

const HideOfferLink: FC<HideOfferLinkProps> = ({ onHide }) => (
  <button
    id={CLAIM_VOTE_IDS.offerHide}
    type="button"
    onClick={onHide}
    className="py-1 text-[13px] text-neutral-9 transition-colors hover:text-neutral-11"
  >
    {DONT_SHOW_AGAIN_LABEL}
  </button>
);

export default HideOfferLink;
