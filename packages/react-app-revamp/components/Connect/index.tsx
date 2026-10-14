import { useModal } from "@getpara/react-sdk-lite";
import { useWallet } from "@hooks/useWallet";
import { useXClaimOffer } from "@hooks/useXClaim/store";
import { FC } from "react";
import AccountDropdown from "./components/AccountDropdown";
import SignInButton from "./components/SignInButton";

export const ConnectButtonCustom: FC = () => {
  const { isConnected, userAddress, disconnect } = useWallet();
  const { openModal } = useModal();
  const claimOffer = useXClaimOffer();

  if (!isConnected || !userAddress) {
    return <SignInButton claimOffer={claimOffer} onSignIn={() => openModal()} />;
  }

  return (
    <AccountDropdown
      address={userAddress}
      displayName={`${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`}
      onDisconnect={disconnect}
      claimOffer={claimOffer}
    />
  );
};
