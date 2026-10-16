import { useWallet } from "@hooks/useWallet";
import { useXClaimOffer } from "@hooks/useXClaim/store";
import { useClaimFirstSignIn } from "@hooks/useXClaim/useClaimFirstSignIn";
import { FC } from "react";
import AccountDropdown from "./components/AccountDropdown";
import SignInButton from "./components/SignInButton";

export const ConnectButtonCustom: FC = () => {
  const { isConnected, userAddress, disconnect } = useWallet();
  const signIn = useClaimFirstSignIn();
  const claimOffer = useXClaimOffer();

  if (!isConnected || !userAddress) {
    return <SignInButton claimOffer={claimOffer} onSignIn={signIn} />;
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
