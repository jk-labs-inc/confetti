import { useWallet } from "@hooks/useWallet";
import { useXClaimSpots } from "@hooks/useXClaim/queries";
import type { XClaimSpots } from "lib/xClaim/types";
import { useWalletHintStore } from "./walletHintStore";

export const useWalletCreditHint = (): XClaimSpots | null => {
  const { isConnected, walletKind } = useWallet();
  const isDismissed = useWalletHintStore(state => state.isDismissed);
  const isOffered = isConnected && walletKind === "external" && !isDismissed;
  const { data: spots } = useXClaimSpots({ enabled: isOffered });
  return isOffered && spots && !spots.paused && spots.open > 0 ? spots : null;
};
