import XClaimAmountSticker from "@components/XClaim/entry/XClaimAmountSticker";
import XClaimSignInHoverCard from "@components/XClaim/entry/XClaimSignInHoverCard";
import { openOfferFor } from "lib/xClaim/view";
import type { XClaimOffer } from "lib/xClaim/types";
import { FC } from "react";

interface SignInButtonProps {
  claimOffer: XClaimOffer;
  onSignIn: () => void;
}

const SignInButton: FC<SignInButtonProps> = ({ claimOffer, onSignIn }) => {
  const claimOpen = openOfferFor(claimOffer, "signed_out");

  return (
    <div className="group/signin relative">
      <button
        onClick={onSignIn}
        type="button"
        className="w-36 h-8 bg-secondary-1 border border-primary-3 text-base font-bold text-neutral-9 rounded-[40px]"
      >
        sign in
      </button>
      {claimOpen && (
        <>
          <XClaimAmountSticker className="absolute -top-3 -right-1.5 px-2 py-0.5 text-[12px] rotate-8" />
          <XClaimSignInHoverCard spots={claimOpen.spots} />
        </>
      )}
    </div>
  );
};

export default SignInButton;
