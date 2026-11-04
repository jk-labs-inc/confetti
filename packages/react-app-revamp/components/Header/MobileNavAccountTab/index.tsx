import ClaimVoteSticker from "@components/ClaimVote/ClaimVoteSticker";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { UserCircleIcon as UserCircleIconSolid } from "@heroicons/react/24/solid";
import { FC } from "react";

interface MobileNavAccountTabProps {
  isConnected: boolean;
  isProfileOpen: boolean;
  hasCreditSticker: boolean;
  onProfileClick: () => void;
  onSignInClick?: () => void;
}

const MobileNavAccountTab: FC<MobileNavAccountTabProps> = ({
  isConnected,
  isProfileOpen,
  hasCreditSticker,
  onProfileClick,
  onSignInClick,
}) => (
  <div className="transition-all duration-500">
    {isConnected ? (
      <div className="relative flex flex-col items-center" onClick={onProfileClick}>
        {hasCreditSticker && (
          <ClaimVoteSticker className="absolute -top-2.5 -right-5 px-1.5 py-px text-[10px] rotate-8" />
        )}
        {isProfileOpen ? (
          <UserCircleIconSolid width={24} height={24} className="text-neutral-11" />
        ) : (
          <UserCircleIcon width={24} height={24} className="text-neutral-11" />
        )}
        <p className="text-[12px]">profile</p>
      </div>
    ) : (
      <div className="flex flex-col items-center" onClick={onSignInClick}>
        <img width={24} height={24} src="/header/wallet.svg" alt="wallet" />
        <p className="text-[12px]">wallet</p>
      </div>
    )}
  </div>
);

export default MobileNavAccountTab;
