import { useXClaim } from "@hooks/useXClaim";
import { takeLanding } from "lib/claimVote/landing";
import { LANDING_WALLET_WAIT_MS } from "lib/xClaim/constants";
import { paraTokenCache } from "lib/xClaim/proof";
import { walletAddressOf } from "lib/xClaim/wallet";
import { useEffect, useRef } from "react";
import { xClaimSheet } from "./store";

export const useXClaimRuntime = () => {
  const claim = useXClaim();
  const address = walletAddressOf(claim.sheet.view.wallet);
  const previousAddress = useRef<string | null>(null);

  useEffect(() => {
    const landing = takeLanding("sheet", Date.now());
    if (!landing) return;
    xClaimSheet.land(landing);
    window.setTimeout(xClaimSheet.endWalletWait, LANDING_WALLET_WAIT_MS);
  }, []);

  useEffect(() => {
    const previous = previousAddress.current;
    previousAddress.current = address;
    if (previous !== null && previous !== address) {
      xClaimSheet.reset();
      paraTokenCache.clear();
    }
  }, [address]);

  return claim;
};
