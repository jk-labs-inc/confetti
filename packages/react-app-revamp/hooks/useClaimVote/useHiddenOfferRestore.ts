import { useWallet } from "@hooks/useWallet";
import { useXClaimSpots } from "@hooks/useXClaim/queries";
import { hasOpenSpots } from "lib/xClaim/view";
import { useShallow } from "zustand/shallow";
import { useHiddenOfferStore } from "./hiddenOfferStore";

export const useHiddenOfferRestore = (): (() => void) | null => {
  const { isConnected, walletKind, userAddress } = useWallet();
  const address = userAddress?.toLowerCase();
  const { isHidden, show } = useHiddenOfferStore(
    useShallow(state => ({ isHidden: !!address && state.wallets.includes(address), show: state.show })),
  );
  const isOffered = isConnected && walletKind === "embedded" && isHidden;
  const { data: spots } = useXClaimSpots({ enabled: isOffered });
  return isOffered && spots && hasOpenSpots(spots) && address ? () => show(address) : null;
};
