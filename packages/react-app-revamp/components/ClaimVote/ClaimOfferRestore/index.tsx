import { CLAIM_VOTE_IDS } from "@components/ClaimVote/constants";
import { OFFER_RESTORE_LABEL, OFFER_RESTORE_LINE } from "@components/ClaimVote/copy";
import { X_CLAIM_ART } from "@components/XClaim/constants";
import { CLAIM_TITLE } from "@components/XClaim/copy";
import { FC } from "react";

interface ClaimOfferRestoreProps {
  onRestore: () => void;
}

const ClaimOfferRestore: FC<ClaimOfferRestoreProps> = ({ onRestore }) => (
  <div className="flex items-center gap-2.5 rounded-2xl bg-neutral-2 p-3">
    <img src={X_CLAIM_ART.ballot.src} alt="" width={44} height={44} className="size-11 shrink-0 object-contain" />
    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
      <p className="font-sabo-filled text-[14px] leading-[1.15] text-neutral-11">{CLAIM_TITLE}</p>
      <p className="text-[13px] leading-[1.4] text-neutral-9">{OFFER_RESTORE_LINE}</p>
    </div>
    <button
      id={CLAIM_VOTE_IDS.offerRestore}
      type="button"
      onClick={onRestore}
      className="shrink-0 rounded-[40px] border border-primary-3 bg-neutral-3 px-3 py-2 text-[13px] font-bold text-neutral-11 transition-colors hover:bg-neutral-4"
    >
      {OFFER_RESTORE_LABEL}
    </button>
  </div>
);

export default ClaimOfferRestore;
