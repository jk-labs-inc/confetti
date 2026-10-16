import XClaimAmountSticker from "@components/XClaim/entry/XClaimAmountSticker";
import XClaimUnclaimedDot from "@components/XClaim/entry/XClaimUnclaimedDot";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { UserCircleIcon as UserCircleIconSolid } from "@heroicons/react/24/solid";
import { openOfferFor, signedOutTeaserFor } from "lib/xClaim/view";
import type { XClaimOffer } from "lib/xClaim/types";
import { FC } from "react";

interface MobileNavAccountTabProps {
  isConnected: boolean;
  isProfileOpen: boolean;
  onProfileClick: () => void;
  onSignInClick?: () => void;
  claimOffer: XClaimOffer;
}

const MobileNavAccountTab: FC<MobileNavAccountTabProps> = ({
  isConnected,
  isProfileOpen,
  onProfileClick,
  onSignInClick,
  claimOffer,
}) => (
  <div className="transition-all duration-500">
    {isConnected ? (
      <div className="relative flex flex-col items-center" onClick={onProfileClick}>
        {isProfileOpen ? (
          <UserCircleIconSolid width={24} height={24} className="text-neutral-11" />
        ) : (
          <UserCircleIcon width={24} height={24} className="text-neutral-11" />
        )}
        <p className="text-[12px]">profile</p>
        {openOfferFor(claimOffer, "signed_in") && (
          <XClaimUnclaimedDot className="-top-0.5 right-0.5 border-true-black" />
        )}
      </div>
    ) : (
      <div className="relative flex flex-col items-center" onClick={onSignInClick}>
        <img width={24} height={24} src="/header/wallet.svg" alt="wallet" />
        <p className="text-[12px]">wallet</p>
        {signedOutTeaserFor(claimOffer) && (
          <XClaimAmountSticker className="absolute -top-1.5 left-3.5 px-[7px] py-px text-[11px] -rotate-8" />
        )}
      </div>
    )}
  </div>
);

export default MobileNavAccountTab;
