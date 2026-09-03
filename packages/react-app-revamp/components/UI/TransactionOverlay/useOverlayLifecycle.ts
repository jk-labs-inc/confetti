import { useEffect } from "react";
import { SUCCESS_DISMISS_MS, SUCCESS_MASCOT_IMAGE } from "./constants";
import { txOverlay } from "./store";
import { TransactionOverlayFlow, TransactionOverlayPhase } from "./types";

interface UseOverlayLifecycleParams {
  isVisible: boolean;
  phase: TransactionOverlayPhase;
  flow: TransactionOverlayFlow;
}

export const useOverlayLifecycle = ({ isVisible, phase, flow }: UseOverlayLifecycleParams) => {
  const persistsOnSuccess = flow === TransactionOverlayFlow.VOTE;

  useEffect(() => {
    if (!isVisible || persistsOnSuccess) return;

    // warm the success mascot so it doesn't pop in late on first success
    const mascot = new window.Image();
    mascot.src = SUCCESS_MASCOT_IMAGE;
  }, [isVisible, persistsOnSuccess]);

  useEffect(() => {
    if (!isVisible || phase !== TransactionOverlayPhase.SUCCESS || persistsOnSuccess) return;

    const timeout = setTimeout(() => txOverlay.dismiss(), SUCCESS_DISMISS_MS);

    return () => clearTimeout(timeout);
  }, [isVisible, phase, persistsOnSuccess]);
};
