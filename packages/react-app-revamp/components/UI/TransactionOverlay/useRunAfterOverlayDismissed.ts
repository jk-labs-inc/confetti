import { useCallback, useEffect, useState } from "react";
import { isInlineOverlayShowing, useTransactionOverlayStore } from "./store";

export const useRunAfterOverlayDismissed = () => {
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const isBlocked = useTransactionOverlayStore(state => pendingAction !== null && isInlineOverlayShowing(state));

  useEffect(() => {
    if (isBlocked || !pendingAction) return;

    setPendingAction(null);
    pendingAction();
  }, [isBlocked, pendingAction]);

  return useCallback((action: () => void) => {
    if (isInlineOverlayShowing(useTransactionOverlayStore.getState())) {
      setPendingAction(() => action);
    } else {
      action();
    }
  }, []);
};
