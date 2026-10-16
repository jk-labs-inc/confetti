import { useModal } from "@getpara/react-sdk-lite";
import { useXClaim } from "@hooks/useXClaim";
import { LANDING_WALLET_WAIT_MS } from "lib/xClaim/constants";
import { takeFlowStarter } from "lib/xClaim/memory";
import { parseRedirect } from "lib/xClaim/outcomes";
import { paraTokenCache } from "lib/xClaim/proof";
import { openOfferFor } from "lib/xClaim/view";
import { useEffect, useRef } from "react";
import { useShallow } from "zustand/shallow";
import { walletAddressOf } from "./queries";
import { publishXClaimOffer, useXClaimStore, xClaimAction, xClaimMemory, xClaimSheet, xClaimSignIn } from "./store";

export const useXClaimRuntime = () => {
  const { isOpen: isParaModalOpen } = useModal();
  const claim = useXClaim();
  const { offer, sheet } = claim;
  const wallet = sheet.view.wallet;
  const { result, signInPending, memoryAddress } = useXClaimStore(
    useShallow(state => ({
      result: state.result,
      signInPending: state.signIn.pending,
      memoryAddress: state.memory?.address ?? null,
    })),
  );
  const previousAddress = useRef<string | null>(null);

  const address = walletAddressOf(wallet);
  const isSignedOut = wallet.kind === "signed_out";

  useEffect(() => publishXClaimOffer(offer), [offer]);

  useEffect(() => {
    const landing = parseRedirect(window.location.href);
    if (!landing) return;
    window.history.replaceState(null, "", landing.cleanUrl);
    const now = Date.now();
    xClaimSheet.land({ result: landing.result, at: now, startedBy: takeFlowStarter(now) });
    window.setTimeout(xClaimSheet.endWalletWait, LANDING_WALLET_WAIT_MS);
  }, []);

  useEffect(() => {
    const previous = previousAddress.current;
    previousAddress.current = address;
    if (previous !== null && previous !== address) {
      xClaimSheet.reset();
      paraTokenCache.clear();
    }
    if (address && wallet.kind === "external") xClaimMemory.load(address);
  }, [address, wallet.kind]);

  useEffect(() => {
    if (wallet.kind !== "external" || result?.source !== "redirect") return;
    if (result.startedBy !== wallet.address.toLowerCase()) return;
    xClaimMemory.mergeHint(wallet.address, result.result);
  }, [wallet, result]);

  useEffect(() => {
    if (isParaModalOpen && isSignedOut) xClaimSignIn.arm();
    if (!isParaModalOpen) xClaimSignIn.modalClosed(Date.now());
  }, [isParaModalOpen, isSignedOut]);

  useEffect(() => {
    if (!signInPending || isSignedOut || isParaModalOpen) return;
    if (offer.status === "off" && offer.reason === "loading") return;
    if (wallet.kind === "external" && memoryAddress !== wallet.address) return;
    xClaimSignIn.consume({ openSheet: openOfferFor(offer, "signed_in") !== null });
  }, [signInPending, isSignedOut, isParaModalOpen, offer, wallet, memoryAddress]);

  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) xClaimAction.clearRedirecting();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  return claim;
};
