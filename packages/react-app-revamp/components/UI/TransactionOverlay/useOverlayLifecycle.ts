import { useEffect } from "react";
import { SUCCESS_DISMISS_MS } from "./constants";
import { txOverlay } from "./store";
import { TransactionOverlayPhase } from "./types";

export const useOverlayLifecycle = (isVisible: boolean, phase: TransactionOverlayPhase) => {
  useEffect(() => {
    if (!isVisible) return;

    // warm the success mascot so it doesn't pop in late on first success
    const mascot = new window.Image();
    mascot.src = "/landing/bubbles-money.png";
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || phase !== TransactionOverlayPhase.SUCCESS) return;

    const timeout = setTimeout(() => txOverlay.dismiss(), SUCCESS_DISMISS_MS);

    return () => clearTimeout(timeout);
  }, [isVisible, phase]);
};
