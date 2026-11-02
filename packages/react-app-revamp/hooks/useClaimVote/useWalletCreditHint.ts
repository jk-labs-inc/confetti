import { useWallet } from "@hooks/useWallet";
import { useXClaimSpots } from "@hooks/useXClaim/queries";
import type { XClaimSpots } from "lib/xClaim/types";

export const useWalletCreditHint = (): XClaimSpots | null => {
  const { isConnected, walletKind } = useWallet();
  const isExternal = isConnected && walletKind === "external";
  const { data: spots } = useXClaimSpots({ enabled: isExternal });
  return isExternal && spots && !spots.paused && spots.open > 0 ? spots : null;
};
