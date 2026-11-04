import { CLAIM_VOTE_IDS } from "@components/ClaimVote/constants";
import { DONT_SHOW_AGAIN_LABEL, SWITCH_SIGN_IN_LABEL, WALLET_CREDIT_HINT } from "@components/ClaimVote/copy";
import { X_CLAIM_ART } from "@components/XClaim/constants";
import { CLAIM_TITLE } from "@components/XClaim/copy";
import SpotsLine from "@components/XClaim/parts/SpotsLine";
import { useWalletHintStore } from "@hooks/useClaimVote/walletHintStore";
import type { XClaimSpots } from "lib/xClaim/types";
import { FC } from "react";

interface WalletCreditHintProps {
  spots: XClaimSpots;
  onSwitch: () => void;
}

const WalletCreditHint: FC<WalletCreditHintProps> = ({ spots, onSwitch }) => {
  const dismiss = useWalletHintStore(state => state.dismiss);

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-neutral-2 p-3">
      <div className="flex items-center gap-2.5">
        <img src={X_CLAIM_ART.ballot.src} alt="" width={60} height={60} className="size-15 shrink-0 object-contain" />
        <div className="flex flex-col gap-1">
          <p className="font-sabo-filled text-[17px] leading-[1.15] text-neutral-11">{CLAIM_TITLE}</p>
          <p className="text-[13px] leading-[1.4] text-neutral-9">{WALLET_CREDIT_HINT}</p>
          <SpotsLine spots={spots} placement="card" />
        </div>
      </div>
      <button
        id={CLAIM_VOTE_IDS.walletSwitch}
        type="button"
        onClick={onSwitch}
        className="w-full rounded-[40px] border border-primary-3 bg-neutral-3 px-4 py-2 text-[14px] font-bold text-neutral-11 transition-colors hover:bg-neutral-4"
      >
        {SWITCH_SIGN_IN_LABEL}
      </button>
      <button
        id={CLAIM_VOTE_IDS.walletHintDismiss}
        type="button"
        onClick={dismiss}
        className="self-center text-[13px] text-neutral-9 transition-colors hover:text-neutral-11"
      >
        {DONT_SHOW_AGAIN_LABEL}
      </button>
    </div>
  );
};

export default WalletCreditHint;
